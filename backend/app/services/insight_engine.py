"""
Rule-based insight discovery engine.
Analyzes the data and generates structured insights (InsightItem).
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

    # 1. Pareto / Concentration Analysis (e.g. 80/20 rule)
    # Find any ID-like columns and any value-like columns (like revenue, sales)
    id_col = None
    value_col = None

    for col in columns:
        col_lower = col.lower()
        if col_lower in ("customer_id", "user_id", "client_id", "product_id", "item_id", "sku"):
            id_col = col
        if col_lower in ("revenue", "sales", "turnover", "income", "amount", "profit", "gross_sales"):
            value_col = col

    if id_col and value_col and df[value_col].dtype.is_numeric():
        try:
            # Group by ID, sum value, sort descending
            grouped = (
                df.group_by(id_col)
                .agg(pl.col(value_col).sum().alias("total_val"))
                .sort("total_val", descending=True)
                .drop_nulls()
            )

            if grouped.height > 10:
                total_sum = grouped["total_val"].sum()
                if total_sum > 0:
                    top_10_pct_count = max(1, int(grouped.height * 0.1))
                    top_10_sum = grouped["total_val"].head(top_10_pct_count).sum()
                    concentration_pct = round((top_10_sum / total_sum) * 100, 1)

                    priority = "low"
                    if concentration_pct >= 70:
                        priority = "high"
                    elif concentration_pct >= 40:
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
                                "total_value": total_sum,
                                "top_10_percent_value": top_10_sum,
                                "entity": id_col,
                                "value_column": value_col,
                            },
                        )
                    )
        except Exception:
            pass

    # 2. Correlation-based insight (e.g., Discount vs Revenue)
    discount_col = None
    revenue_col = None

    for col in columns:
        col_lower = col.lower()
        if "discount" in col_lower or "promo" in col_lower:
            discount_col = col
        if col_lower in ("revenue", "sales", "turnover", "amount", "gross_sales"):
            revenue_col = col

    if discount_col and revenue_col and df[discount_col].dtype.is_numeric() and df[revenue_col].dtype.is_numeric():
        try:
            corr = df.select(pl.corr(discount_col, revenue_col)).item()
            if corr is not None and not pl.Series([corr]).is_nan().any():
                corr_val = float(corr)
                if corr_val < -0.3:
                    # Negative correlation: higher discounts = lower revenue/profit
                    insights.append(
                        InsightItem(
                            category="Correlation",
                            description=(
                                f"Negative correlation detected: There is a moderate negative relationship ({corr_val:.2f}) "
                                f"between '{discount_col}' and '{revenue_col}', indicating higher discounts might drag down total sales value."
                            ),
                            confidence_score=round(abs(corr_val) * 100, 1),
                            priority="high" if corr_val < -0.5 else "medium",
                            supporting_data={
                                "correlation": corr_val,
                                "column_x": discount_col,
                                "column_y": revenue_col,
                            },
                        )
                    )
                elif corr_val > 0.4:
                    # Positive correlation
                    insights.append(
                        InsightItem(
                            category="Correlation",
                            description=(
                                f"Positive relationship detected: A correlation of {corr_val:.2f} exists between "
                                f"'{discount_col}' and '{revenue_col}', showing sales scale positively with promotion levels."
                            ),
                            confidence_score=round(corr_val * 100, 1),
                            priority="medium",
                            supporting_data={
                                "correlation": corr_val,
                                "column_x": discount_col,
                                "column_y": revenue_col,
                            },
                        )
                    )
        except Exception:
            pass

    # 3. Category Contribution Analysis
    cat_col = None
    val_col = None

    # Find a categorical column with moderate cardinality and a numeric value column
    for col in columns:
        if df[col].dtype == pl.Utf8:
            uc = df[col].n_unique()
            if 2 <= uc <= 15:
                cat_col = col
                break
    for col in columns:
        col_lower = col.lower()
        if col_lower in ("revenue", "sales", "profit", "amount", "cost", "orders"):
            val_col = col
            break

    if cat_col and val_col and df[val_col].dtype.is_numeric():
        try:
            grouped = (
                df.group_by(cat_col)
                .agg(pl.col(val_col).sum().alias("total"))
                .sort("total", descending=True)
            )
            total_sum = grouped["total"].sum()
            if total_sum > 0:
                top_row = grouped.row(0)
                top_cat = top_row[0]
                top_val = top_row[1]
                pct = round((top_val / total_sum) * 100, 1)

                if pct >= 40:
                    priority = "high" if pct >= 60 else "medium"
                    insights.append(
                        InsightItem(
                            category="Contribution",
                            description=(
                                f"Significant category concentration: '{top_cat}' in '{cat_col}' "
                                f"contributes {pct}% of the total '{val_col}' ({top_val:,.2f} of {total_sum:,.2f})."
                            ),
                            confidence_score=98.0,
                            priority=priority,
                            supporting_data={
                                "category": str(top_cat),
                                "category_column": cat_col,
                                "value_column": val_col,
                                "percentage": pct,
                                "value": top_val,
                                "total": total_sum,
                            },
                        )
                    )
        except Exception:
            pass

    # 4. Temporal / Trend patterns
    date_col = None
    for col in columns:
        if df[col].dtype.is_temporal():
            date_col = col
            break

    if date_col and val_col and df[val_col].dtype.is_numeric():
        try:
            # Group by day of week
            dow_df = (
                df.with_columns(pl.col(date_col).dt.weekday().alias("weekday"))
                .group_by("weekday")
                .agg(pl.col(val_col).mean().alias("avg_val"))
                .sort("avg_val", descending=True)
            )

            if dow_df.height >= 5:
                top_day = int(dow_df.row(0)[0])
                # Polars weekday: 1 (Mon) to 7 (Sun)
                day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                top_day_name = day_names[top_day - 1]

                # Check weekend vs weekday performance
                we_avg = (
                    df.with_columns(pl.col(date_col).dt.weekday().alias("weekday"))
                    .filter(pl.col("weekday").is_in([6, 7]))
                    .select(pl.col(val_col).mean())
                    .item()
                )
                wd_avg = (
                    df.with_columns(pl.col(date_col).dt.weekday().alias("weekday"))
                    .filter(~pl.col("weekday").is_in([6, 7]))
                    .select(pl.col(val_col).mean())
                    .item()
                )

                if we_avg is not None and wd_avg is not None and wd_avg > 0:
                    ratio = we_avg / wd_avg
                    if ratio > 1.25:
                        diff_pct = round((ratio - 1.0) * 100, 1)
                        insights.append(
                            InsightItem(
                                category="Temporal Pattern",
                                description=(
                                    f"Weekend sales surge: Average '{val_col}' on weekends (Saturday/Sunday) "
                                    f"is {diff_pct}% higher than weekday averages."
                                ),
                                confidence_score=85.0,
                                priority="medium",
                                supporting_data={
                                    "weekend_average": float(we_avg),
                                    "weekday_average": float(wd_avg),
                                    "ratio": ratio,
                                    "diff_percentage": diff_pct,
                                },
                            )
                        )
                    elif ratio < 0.75:
                        diff_pct = round((1.0 - ratio) * 100, 1)
                        insights.append(
                            InsightItem(
                                category="Temporal Pattern",
                                description=(
                                    f"Weekday dominant sales: Average '{val_col}' on weekdays "
                                    f"is {diff_pct}% higher than weekend averages."
                                ),
                                confidence_score=85.0,
                                priority="medium",
                                supporting_data={
                                    "weekend_average": float(we_avg),
                                    "weekday_average": float(wd_avg),
                                    "ratio": ratio,
                                    "diff_percentage": diff_pct,
                                },
                            )
                        )
        except Exception:
            pass

    # 5. Margin warning
    margin_col = None
    revenue_col = None
    product_name_col = None

    for col in columns:
        col_lower = col.lower()
        if "margin" in col_lower or "profit" in col_lower:
            margin_col = col
        if col_lower in ("revenue", "sales", "turnover", "amount", "gross_sales"):
            revenue_col = col
        if any(term in col_lower for term in ("product_name", "item_name", "title", "product_id", "product")):
            product_name_col = col

    if margin_col and revenue_col and product_name_col and df[margin_col].dtype.is_numeric() and df[revenue_col].dtype.is_numeric():
        try:
            # Group by product, sum revenue, mean margin
            grouped = (
                df.group_by(product_name_col)
                .agg(
                    pl.col(revenue_col).sum().alias("total_rev"),
                    pl.col(margin_col).mean().alias("avg_margin")
                )
                .sort("total_rev", descending=True)
                .drop_nulls()
            )

            if grouped.height >= 5:
                # Find product with top revenue but low margin
                # Let's define low margin as below the median margin of top revenue products
                median_margin = grouped["avg_margin"].median()
                if median_margin is not None:
                    problem_product = grouped.filter(
                        (pl.col("avg_margin") < median_margin * 0.5)
                    ).first()

                    if problem_product.height > 0:
                        prod_name = problem_product[product_name_col][0]
                        prod_rev = problem_product["total_rev"][0]
                        prod_margin = problem_product["avg_margin"][0]

                        insights.append(
                            InsightItem(
                                category="Margin Warning",
                                description=(
                                    f"Product margin warning: '{prod_name}' has high revenue ({prod_rev:,.2f}) "
                                    f"but a relatively poor average margin of {prod_margin:.2f}."
                                ),
                                confidence_score=90.0,
                                priority="high",
                                supporting_data={
                                    "product": str(prod_name),
                                    "revenue": float(prod_rev),
                                    "margin": float(prod_margin),
                                    "median_margin": float(median_margin),
                                },
                            )
                        )
        except Exception:
            pass

    # 6. Categorical Dominance / Distribution Imbalance Checker
    for col in columns:
        if df[col].dtype == pl.Utf8:
            try:
                value_counts = df[col].value_counts().sort("count", descending=True)
                if value_counts.height > 0:
                    top_val = value_counts[col][0]
                    top_count = value_counts["count"][0]
                    pct = round((top_count / total_rows) * 100, 1)
                    if 60.0 < pct < 99.5:  # Skip completely uniform columns (like IDs) or low concentration
                        insights.append(
                            InsightItem(
                                category="Distribution Imbalance",
                                description=(
                                    f"Dominant categorical concentration: Value '{top_val}' in column '{col}' "
                                    f"represents {pct}% of all records ({top_count:,} out of {total_rows:,})."
                                ),
                                confidence_score=99.0,
                                priority="medium" if pct < 85 else "high",
                                supporting_data={
                                    "column": col,
                                    "value": str(top_val),
                                    "count": top_count,
                                    "percentage": pct
                                },
                            )
                        )
            except Exception:
                pass

    # 7. Categorical Association / Relationship Checker
    for i in range(min(6, len(columns))):
        col1 = columns[i]
        if df[col1].dtype != pl.Utf8:
            continue
        for j in range(i + 1, min(7, len(columns))):
            col2 = columns[j]
            if df[col2].dtype != pl.Utf8:
                continue
            try:
                pairs = df.group_by([col1, col2]).agg(pl.len().alias("count")).sort("count", descending=True)
                if pairs.height > 0:
                    top_col1_val = pairs[col1][0]
                    top_col2_val = pairs[col2][0]
                    pair_count = pairs["count"][0]
                    
                    total_col1 = df.filter(pl.col(col1) == top_col1_val).height
                    if total_col1 > 0:
                        assoc_pct = round((pair_count / total_col1) * 100, 1)
                        if 80.0 <= assoc_pct < 100.0:  # Strong non-trivial association
                            insights.append(
                                InsightItem(
                                    category="Categorical Association",
                                    description=(
                                        f"Strong categorical association: {assoc_pct}% of records where "
                                        f"'{col1}' is '{top_col1_val}' also have '{col2}' as '{top_col2_val}'."
                                    ),
                                    confidence_score=assoc_pct,
                                    priority="high" if assoc_pct > 93 else "medium",
                                    supporting_data={
                                        "column_a": col1,
                                        "value_a": str(top_col1_val),
                                        "column_b": col2,
                                        "value_b": str(top_col2_val),
                                        "association_percentage": assoc_pct
                                    },
                                )
                            )
            except Exception:
                pass

    # If no insights, fallback to generic
    if len(insights) == 0:
        insights.append(
            InsightItem(
                category="General",
                description=f"Dataset is clean and contains {total_rows:,} records with {len(columns)} attributes.",
                confidence_score=100.0,
                priority="low",
                supporting_data={"rows": total_rows, "columns": len(columns)},
            )
        )

    return insights
