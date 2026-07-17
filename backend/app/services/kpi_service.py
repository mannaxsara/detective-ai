"""
KPI detection service for DetectiveAI.
Identifies potential metrics like revenue, profit, costs, orders, customers, and margins
based on column name pattern matching.
"""

from __future__ import annotations

import re
from typing import Any
import polars as pl
from app.schemas.analysis import KPICard
from app.services.profiling_service import _load_dataframe

# Common pattern mappings for KPIs
KPI_PATTERNS = {
    "revenue": (r"(revenue|sales|turnover|income|amount_spent|gross_sales)", "DollarSign"),
    "profit": (r"(profit|net_profit|earnings|gain|margin_value)", "TrendingUp"),
    "cost": (r"(cost|expense|spending|cost_of_goods_sold|cogs|fee)", "CreditCard"),
    "orders": (r"(orders|transactions|purchases|sales_count|order_id|invoice_id)", "ShoppingCart"),
    "customers": (r"(customers|users|clients|subscribers|buyer_id|user_id|customer_id)", "Users"),
    "products": (r"(products|items|skus|product_id|item_id)", "Package"),
    "quantity": (r"(quantity|qty|volume|inventory|stock)", "Layers"),
    "discount": (r"(discount|markdown|promo_reduction)", "Percent"),
}

def detect_kpis(file_path: str, file_type: str) -> list[KPICard]:
    """Auto-detect KPI metrics from the dataset and return structured KPI cards."""
    try:
        df = _load_dataframe(file_path, file_type)
    except Exception:
        return []

    if df.height == 0:
        return []

    kpi_cards: list[KPICard] = []

    # Check temporal column to compute trend over time
    date_col = None
    for col in df.columns:
        if df[col].dtype.is_temporal():
            date_col = col
            break

    # If date column exists, we sort by date to compute previous and current periods
    temporal_split = False
    df_prev = None
    df_curr = None

    if date_col and df.height >= 4:
        try:
            df_sorted = df.sort(date_col)
            mid = df_sorted.height // 2
            df_prev = df_sorted.slice(0, mid)
            df_curr = df_sorted.slice(mid, df_sorted.height - mid)
            temporal_split = True
        except Exception:
            temporal_split = False

    for kpi_name, (pattern, icon) in KPI_PATTERNS.items():
        matched_col = None
        for col in df.columns:
            if re.search(pattern, col.lower()):
                matched_col = col
                break

        if not matched_col:
            continue

        try:
            series = df[matched_col]
            dtype = series.dtype

            # Categorical/ID based counts (like orders, customers, products)
            if kpi_name in ("orders", "customers", "products"):
                # Unique counts
                val = int(series.n_unique())
                prev_val = None
                change_pct = None
                trend = "stable"

                if temporal_split and df_prev is not None and df_curr is not None:
                    prev_val = int(df_prev[matched_col].n_unique())
                    curr_val = int(df_curr[matched_col].n_unique())
                    if prev_val > 0:
                        change_pct = round(((curr_val - prev_val) / prev_val) * 100, 2)
                        trend = "up" if change_pct > 0.5 else ("down" if change_pct < -0.5 else "stable")
                    else:
                        change_pct = 0.0

                formatted = f"{val:,}"
                kpi_cards.append(
                    KPICard(
                        name=f"Total {kpi_name.title()}",
                        value=val,
                        formatted_value=formatted,
                        trend=trend,
                        change_percentage=change_pct,
                        previous_value=prev_val,
                        icon=icon,
                    )
                )

            # Numeric sum/average metrics (like revenue, profit, cost, quantity)
            elif dtype.is_numeric():
                series_non_null = series.drop_nulls()
                if len(series_non_null) == 0:
                    continue

                # Sum or mean based on metric
                use_avg = kpi_name in ("discount", "margin")
                
                val = float(series_non_null.mean() if use_avg else series_non_null.sum())
                prev_val = None
                change_pct = None
                trend = "stable"

                if temporal_split and df_prev is not None and df_curr is not None:
                    s_prev = df_prev[matched_col].drop_nulls()
                    s_curr = df_curr[matched_col].drop_nulls()
                    
                    if len(s_prev) > 0 and len(s_curr) > 0:
                        prev_val = float(s_prev.mean() if use_avg else s_prev.sum())
                        curr_val = float(s_curr.mean() if use_avg else s_curr.sum())
                        if prev_val != 0:
                            change_pct = round(((curr_val - prev_val) / abs(prev_val)) * 100, 2)
                            trend = "up" if change_pct > 0.5 else ("down" if change_pct < -0.5 else "stable")
                        else:
                            change_pct = 0.0

                if kpi_name in ("revenue", "profit", "cost"):
                    if val >= 1_000_000:
                        formatted = f"${val/1_000_000:.2f}M"
                    elif val >= 1_000:
                        formatted = f"${val/1_000:.1f}K"
                    else:
                        formatted = f"${val:.2f}"
                elif kpi_name == "discount":
                    formatted = f"{val:.1f}%" if val <= 100 else f"{val:.1f}"
                else:
                    formatted = f"{val:,.0f}" if val.is_integer() else f"{val:,.2f}"

                kpi_cards.append(
                    KPICard(
                        name=f"Average {kpi_name.title()}" if use_avg else f"Total {kpi_name.title()}",
                        value=val,
                        formatted_value=formatted,
                        trend=trend,
                        change_percentage=change_pct,
                        previous_value=prev_val,
                        icon=icon,
                    )
                )

        except Exception:
            continue

    # Default fallback: Rows count as a KPI card if no others found or as an extra
    kpi_cards.append(
        KPICard(
            name="Total Rows",
            value=df.height,
            formatted_value=f"{df.height:,}",
            trend="stable",
            change_percentage=0.0,
            previous_value=None,
            icon="Database",
        )
    )

    return kpi_cards
