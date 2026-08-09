"""
Rule-based insight discovery engine.
Analyzes the dataset using Polars and generates structured, high-value business insights (InsightItem).
"""

from __future__ import annotations

import re
from typing import Any
import polars as pl
from app.schemas.analysis import InsightItem
from app.services.profiling_service import _load_dataframe

def discover_insights(file_path: str, file_type: str) -> list[InsightItem]:
    """Analyze the dataset and generate high-value business insights with confidence scores."""
    try:
        df = _load_dataframe(file_path, file_type)
    except Exception:
        return []

    if df.height == 0:
        return []

    insights: list[InsightItem] = []

    # Helper variables
    columns = df.columns
    total_rows = df.height

    # Classify columns
    num_cols = [c for c, d in zip(df.columns, df.dtypes) if d.is_numeric()]
    cat_cols = [c for c, d in zip(df.columns, df.dtypes) if d in (pl.Utf8, pl.Categorical)]
    date_cols = [c for c, d in zip(df.columns, df.dtypes) if d.is_temporal()]

    # If Polars loaded numeric columns as string, try finding numeric columns from strings
    if not num_cols:
        for c in cat_cols:
            try:
                converted = df[c].cast(pl.Float64, strict=False)
                if converted.drop_nulls().len() > df.height * 0.5:
                    num_cols.append(c)
            except Exception:
                pass

    # 1. Primary Value & ID Selection
    id_col = None
    value_col = None

    for col in columns:
        col_lower = col.lower()
        if any(k in col_lower for k in ["id", "customer", "user", "client", "sku", "product", "code", "item"]):
            id_col = col
        if any(k in col_lower for k in ["revenue", "sales", "turnover", "income", "amount", "profit", "price", "cost", "total", "quantity", "value"]):
            value_col = col

    if not value_col and num_cols:
        value_col = num_cols[0]
    if not id_col and cat_cols:
        id_col = cat_cols[0]

    # 2. Pareto / Concentration Analysis (e.g. 80/20 rule)
    if id_col and value_col and value_col in num_cols:
        try:
            grouped = (
                df.group_by(id_col)
                .agg(pl.col(value_col).sum().alias("total_val"))
                .sort("total_val", descending=True)
                .drop_nulls()
            )

            if grouped.height >= 5:
                total_sum = float(grouped["total_val"].sum() or 0)
                if total_sum > 0:
                    top_10_pct_count = max(1, int(grouped.height * 0.1))
                    top_10_sum = float(grouped["total_val"].head(top_10_pct_count).sum() or 0)
                    concentration_pct = round((top_10_sum / total_sum) * 100, 1)

                    priority = "low"
                    if concentration_pct >= 60:
                        priority = "high"
                    elif concentration_pct >= 35:
                        priority = "medium"

                    insights.append(
                        InsightItem(
                            category="Concentration",
                            description=(
                                f"High concentration of value: The top 10% of {id_col.replace('_', ' ').title()}s "
                                f"contribute {concentration_pct}% of the total {value_col.replace('_', ' ')}."
                            ),
                            confidence_score=95.0,
                            priority=priority,
                            supporting_data={
                                "concentration_percentage": concentration_pct,
                                "total_value": round(total_sum, 2),
                                "top_10_percent_value": round(top_10_sum, 2),
                                "entity": id_col,
                                "value_column": value_col,
                            },
                        )
                    )
        except Exception:
            pass

    # 3. Category Contribution Analysis
    if cat_cols and num_cols:
        for c_col in cat_cols[:2]:
            v_col = value_col or num_cols[0]
            try:
                uc = df[c_col].n_unique()
                if 2 <= uc <= 25:
                    grouped = (
                        df.group_by(c_col)
                        .agg(pl.col(v_col).sum().alias("total"))
                        .sort("total", descending=True)
                        .drop_nulls()
                    )
                    total_sum = float(grouped["total"].sum() or 0)
                    if total_sum > 0 and grouped.height > 0:
                        top_row = grouped.row(0)
                        top_cat = str(top_row[0])
                        top_val = float(top_row[1])
                        pct = round((top_val / total_sum) * 100, 1)

                        if pct >= 25:
                            priority = "high" if pct >= 55 else "medium"
                            insights.append(
                                InsightItem(
                                    category="Contribution",
                                    description=(
                                        f"Primary contributor flag: '{top_cat}' in '{c_col}' "
                                        f"accounts for {pct}% of overall '{v_col}' ({top_val:,.2f} of {total_sum:,.2f})."
                                    ),
                                    confidence_score=98.0,
                                    priority=priority,
                                    supporting_data={
                                        "category": top_cat,
                                        "category_column": c_col,
                                        "value_column": v_col,
                                        "percentage": pct,
                                        "value": round(top_val, 2),
                                        "total": round(total_sum, 2),
                                    },
                                )
                            )
            except Exception:
                pass

    # 4. Correlation Analysis between Numeric Pairs
    if len(num_cols) >= 2:
        for i in range(len(num_cols)):
            for j in range(i + 1, min(len(num_cols), i + 4)):
                col1 = num_cols[i]
                col2 = num_cols[j]
                try:
                    corr = df.select(pl.corr(col1, col2)).item()
                    if corr is not None and not pl.Series([corr]).is_nan().any():
                        corr_val = float(corr)
                        if abs(corr_val) >= 0.35:
                            rel_type = "positive" if corr_val > 0 else "inverse (negative)"
                            priority = "high" if abs(corr_val) >= 0.65 else "medium"
                            insights.append(
                                InsightItem(
                                    category="Correlation",
                                    description=(
                                        f"Strong statistical relationship ({corr_val:.2f}): {col1} and {col2} "
                                        f"exhibit a clear {rel_type} linear correlation across all records."
                                    ),
                                    confidence_score=round(abs(corr_val) * 100, 1),
                                    priority=priority,
                                    supporting_data={
                                        "correlation": round(corr_val, 3),
                                        "column_1": col1,
                                        "column_2": col2,
                                    },
                                )
                            )
                except Exception:
                    pass

    # 5. Outlier & Skewness Analysis for Numeric Columns
    for col in num_cols[:3]:
        try:
            mean_val = float(df[col].mean() or 0)
            median_val = float(df[col].median() or 0)
            std_val = float(df[col].std() or 0)

            if std_val > 0 and mean_val != 0:
                skew_ratio = abs(mean_val - median_val) / std_val
                if skew_ratio > 0.4:
                    direction = "right (skewed by high values)" if mean_val > median_val else "left (skewed by low values)"
                    insights.append(
                        InsightItem(
                            category="Distribution Skew",
                            description=(
                                f"Asymmetric distribution in '{col}': Mean ({mean_val:,.2f}) deviates significantly from "
                                f"Median ({median_val:,.2f}), indicating data is {direction}."
                            ),
                            confidence_score=92.0,
                            priority="medium",
                            supporting_data={
                                "column": col,
                                "mean": round(mean_val, 2),
                                "median": round(median_val, 2),
                                "std_dev": round(std_val, 2),
                            },
                        )
                    )
        except Exception:
            pass

    # 6. Fallback General Summary Insight if items are low
    if len(insights) < 2:
        insights.append(
            InsightItem(
                category="Dataset Overview",
                description=(
                    f"Dataset profile complete: Parsed {total_rows:,} total records across {len(columns)} attributes. "
                    f"Identified {len(num_cols)} numerical features and {len(cat_cols)} categorical fields."
                ),
                confidence_score=100.0,
                priority="low",
                supporting_data={
                    "total_rows": total_rows,
                    "total_columns": len(columns),
                    "numeric_columns": len(num_cols),
                    "categorical_columns": len(cat_cols),
                },
            )
        )

    return insights
