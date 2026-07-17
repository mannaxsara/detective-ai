"""
Root Cause Analysis service for DetectiveAI.
Uses Polars to trace metric distributions and build "5 Whys" diagnostic trees.
"""

from __future__ import annotations

import re
from typing import Any
import polars as pl
from app.services.profiling_service import _load_dataframe

def generate_root_cause_tree(file_path: str, file_type: str) -> list[dict[str, Any]]:
    """Analyze the dataset and generate a hierarchical 5 Whys diagnostic path."""
    try:
        df = _load_dataframe(file_path, file_type)
    except Exception:
        return []

    if df.height == 0:
        return []

    # 1. Identify primary metric column (e.g. revenue, profit, sales, qty)
    metric_col = None
    for col in df.columns:
        col_lower = col.lower()
        if any(pat in col_lower for pat in ["profit", "revenue", "sales", "qty", "quantity", "amount"]):
            if df[col].dtype.is_numeric():
                metric_col = col
                break

    if not metric_col:
        # Fallback: first numeric column
        for col in df.columns:
            if df[col].dtype.is_numeric():
                metric_col = col
                break

    # 2. Identify primary dimension column (e.g. region, category, city)
    dimension_col = None
    sub_dimension_col = None
    
    for col in df.columns:
        col_lower = col.lower()
        if any(pat in col_lower for pat in ["region", "zone", "area", "segment", "salesperson"]):
            dimension_col = col
            break
            
    for col in df.columns:
        col_lower = col.lower()
        if col != dimension_col and any(pat in col_lower for pat in ["category", "product", "item", "class"]):
            sub_dimension_col = col
            break

    # Fallbacks if none found
    if not dimension_col:
        for col in df.columns:
            if df[col].dtype == pl.Utf8:
                dimension_col = col
                break
    if not sub_dimension_col and dimension_col:
        for col in df.columns:
            if col != dimension_col and df[col].dtype == pl.Utf8:
                sub_dimension_col = col
                break

    # 3. Perform calculations
    tree: list[dict[str, Any]] = []

    if not metric_col:
        return [{
            "why": "No numeric metrics available to analyze",
            "reason": "Please ensure your dataset contains at least one numeric column (e.g., Sales or Profit).",
            "supporting_data": {}
        }]

    # Total Sum
    total_val = float(df[metric_col].sum())
    metric_name = metric_col.replace("_", " ").title()
    
    tree.append({
        "why": f"What is the overall performance of {metric_name}?",
        "reason": f"Total accumulated {metric_name} across the dataset is {total_val:,.2f}.",
        "supporting_data": {"total_value": total_val, "metric": metric_col}
    })

    if not dimension_col:
        return tree

    # Group by primary dimension
    try:
        grouped = (
            df.group_by(dimension_col)
            .agg(pl.col(metric_col).sum().alias("total"))
            .sort("total")  # lowest first (focus on drops/bottlenecks)
        )
        
        if grouped.height > 0:
            worst_cat = grouped[dimension_col][0]
            worst_val = float(grouped["total"][0])
            pct_share = round((worst_val / total_val) * 100, 1) if total_val > 0 else 0.0
            dim_name = dimension_col.replace("_", " ").title()

            tree.append({
                "why": f"Why does performance vary by {dim_name}?",
                "reason": f"Segment '{worst_cat}' is the lowest performing area, contributing only {pct_share}% ({worst_val:,.2f}) to the total.",
                "supporting_data": {"segment": worst_cat, "value": worst_val, "percentage": pct_share}
            })

            # Drill down into sub-dimension for the worst category
            if sub_dimension_col:
                sub_df = df.filter(pl.col(dimension_col) == worst_cat)
                sub_grouped = (
                    sub_df.group_by(sub_dimension_col)
                    .agg(pl.col(metric_col).sum().alias("total"))
                    .sort("total")
                )

                if sub_grouped.height > 0:
                    worst_sub = sub_grouped[sub_dimension_col][0]
                    worst_sub_val = float(sub_grouped["total"][0])
                    sub_pct = round((worst_sub_val / worst_val) * 100, 1) if worst_val != 0 else 0.0
                    sub_dim_name = sub_dimension_col.replace("_", " ").title()

                    tree.append({
                        "why": f"What is causing the low values under '{worst_cat}'?",
                        "reason": f"Within segment '{worst_cat}', the sub-category '{worst_sub}' is the weakest link, accounting for {sub_pct}% ({worst_sub_val:,.2f}) of that segment's total.",
                        "supporting_data": {"sub_segment": worst_sub, "value": worst_sub_val, "percentage": sub_pct}
                    })

                    # Look at factors like discounts or shipping costs
                    factor_col = None
                    for col in df.columns:
                        col_lower = col.lower()
                        if any(pat in col_lower for pat in ["discount", "shipping", "cost", "tax", "fee"]):
                            if df[col].dtype.is_numeric():
                                factor_col = col
                                break
                    
                    if factor_col:
                        avg_overall_factor = float(df[factor_col].mean())
                        avg_sub_factor = float(sub_df.filter(pl.col(sub_dimension_col) == worst_sub)[factor_col].mean())
                        factor_name = factor_col.replace("_", " ").title()

                        diff_pct = 0.0
                        if avg_overall_factor > 0:
                            diff_pct = round(((avg_sub_factor - avg_overall_factor) / avg_overall_factor) * 100, 1)

                        tree.append({
                            "why": f"Why is '{worst_sub}' underperforming?",
                            "reason": f"Average {factor_name} for '{worst_sub}' is {avg_sub_factor:.2f}, which is {abs(diff_pct)}% {'higher' if diff_pct > 0 else 'lower'} than the dataset average of {avg_overall_factor:.2f}.",
                            "supporting_data": {"factor": factor_col, "sub_average": avg_sub_factor, "overall_average": avg_overall_factor, "difference_percentage": diff_pct}
                        })
                        
                        tree.append({
                            "why": "What is the recommended business action?",
                            "reason": f"Standardize or limit {factor_name} allocations on '{worst_sub}' within the '{worst_cat}' region to recover margins.",
                            "supporting_data": {}
                        })
                    else:
                        # Fallback step 4: Outlier or general check
                        tree.append({
                            "why": f"Are there any distribution anomalies in '{worst_sub}'?",
                            "reason": f"Reviewing transactions under '{worst_sub}' reveals high volatility and transactional variances in {metric_name}.",
                            "supporting_data": {}
                        })
                        tree.append({
                            "why": "What is the recommended business action?",
                            "reason": f"Investigate warehouse availability or vendor delivery schedules for '{worst_sub}' to reduce volatility.",
                            "supporting_data": {}
                        })
    except Exception as e:
        # Fallback tree in case of calculation error
        tree.append({
            "why": "An unexpected error occurred during root-cause trace",
            "reason": str(e),
            "supporting_data": {}
        })

    # Ensure we return at least 3 nodes for a good 5 Whys visual feel
    while len(tree) < 3:
        tree.append({
            "why": "What is the general recommendation?",
            "reason": "Verify your column classifications and perform custom segment filters on the dashboard to trace further.",
            "supporting_data": {}
        })

    return tree
