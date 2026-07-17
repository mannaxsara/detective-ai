"""
EDA service – automatic chart generation producing ECharts-compatible configs.

Analyses column types to pick appropriate visualizations and returns complete
``echarts.setOption()``-ready configuration dictionaries.
"""

from __future__ import annotations

import math
from typing import Any

import polars as pl

from app.schemas.analysis import ChartConfig
from app.services.profiling_service import _load_dataframe


# ── Helpers ───────────────────────────────────────────────────────────────────

def _numeric_cols(df: pl.DataFrame) -> list[str]:
    return [c for c in df.columns if df[c].dtype.is_numeric()]


def _categorical_cols(df: pl.DataFrame, max_unique: int = 200) -> list[str]:
    return [
        c
        for c in df.columns
        if (df[c].dtype == pl.Utf8 or df[c].dtype == pl.Categorical)
        and df[c].n_unique() <= max_unique
    ]


def _datetime_cols(df: pl.DataFrame) -> list[str]:
    return [c for c in df.columns if df[c].dtype.is_temporal()]


def _safe(val: Any) -> Any:
    """Make a value JSON-safe."""
    if val is None:
        return None
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
    return val


# ── Chart generators ──────────────────────────────────────────────────────────


def _correlation_heatmap(df: pl.DataFrame, num_cols: list[str]) -> ChartConfig | None:
    """Pearson correlation matrix as an ECharts heatmap."""
    if len(num_cols) < 2:
        return None
    sub = df.select(num_cols).drop_nulls()
    if sub.height < 5:
        return None

    corr_data: list[list[Any]] = []
    for i, c1 in enumerate(num_cols):
        for j, c2 in enumerate(num_cols):
            r = sub.select(pl.corr(c1, c2)).item()
            corr_data.append([i, j, round(_safe(r) or 0, 3)])

    config: dict[str, Any] = {
        "tooltip": {"position": "top"},
        "grid": {"top": "12%", "bottom": "25%", "left": "15%", "right": "5%", "containLabel": True},
        "xAxis": {"type": "category", "data": num_cols, "splitArea": {"show": True},
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
        "yAxis": {"type": "category", "data": num_cols, "splitArea": {"show": True}},
        "visualMap": {"min": -1, "max": 1, "calculable": True, "orient": "horizontal",
                      "left": "center", "bottom": "0%",
                      "inRange": {"color": ["#313695", "#4575b4", "#74add1",
                                             "#abd9e9", "#fee090", "#fdae61",
                                             "#f46d43", "#d73027", "#a50026"]}},
        "series": [{"name": "Correlation", "type": "heatmap", "data": corr_data,
                    "label": {"show": True, "fontSize": 10},
                    "emphasis": {"itemStyle": {"shadowBlur": 10, "shadowColor": "rgba(0,0,0,0.5)"}}}],
    }
    return ChartConfig(
        chart_type="heatmap",
        title="Correlation Matrix",
        description="Pearson correlation coefficients between numeric columns",
        config=config,
    )


def _histogram(df: pl.DataFrame, col: str, bins: int = 30) -> ChartConfig:
    """Histogram for a numeric column."""
    series = df[col].drop_nulls().cast(pl.Float64)
    min_val = float(series.min())  # type: ignore[arg-type]
    max_val = float(series.max())  # type: ignore[arg-type]
    if min_val == max_val:
        bin_edges = [min_val, min_val + 1]
        counts = [int(series.len())]
    else:
        step = (max_val - min_val) / bins
        bin_edges = [round(min_val + i * step, 4) for i in range(bins + 1)]
        counts = []
        for i in range(bins):
            lo, hi = bin_edges[i], bin_edges[i + 1]
            if i == bins - 1:
                c = int(series.filter((series >= lo) & (series <= hi)).len())
            else:
                c = int(series.filter((series >= lo) & (series < hi)).len())
            counts.append(c)

    labels = [f"{bin_edges[i]:.1f}" for i in range(len(counts))]

    config: dict[str, Any] = {
        "tooltip": {"trigger": "axis", "axisPointer": {"type": "shadow"}},
        "grid": {"bottom": "22%", "top": "12%", "left": "10%", "right": "10%", "containLabel": True},
        "xAxis": {"type": "category", "data": labels, "name": col, "nameLocation": "middle", "nameGap": 35,
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
        "yAxis": {"type": "value", "name": "Frequency"},
        "series": [{"name": col, "type": "bar", "data": counts,
                    "itemStyle": {"color": "#5470c6"}}],
    }
    return ChartConfig(
        chart_type="histogram",
        title=f"Distribution of {col}",
        description=f"Histogram showing the frequency distribution of {col}",
        config=config,
    )


def _boxplot(df: pl.DataFrame, num_cols: list[str]) -> ChartConfig | None:
    """Box plots for numeric columns."""
    if not num_cols:
        return None
    box_data: list[list[float | None]] = []
    valid_cols: list[str] = []
    for col in num_cols[:10]:  # limit to 10
        s = df[col].drop_nulls().cast(pl.Float64)
        if s.len() < 5:
            continue
        mn = _safe(float(s.min()))  # type: ignore[arg-type]
        q1 = _safe(float(s.quantile(0.25)))  # type: ignore[arg-type]
        md = _safe(float(s.median()))  # type: ignore[arg-type]
        q3 = _safe(float(s.quantile(0.75)))  # type: ignore[arg-type]
        mx = _safe(float(s.max()))  # type: ignore[arg-type]
        box_data.append([mn, q1, md, q3, mx])
        valid_cols.append(col)

    if not valid_cols:
        return None

    config: dict[str, Any] = {
        "tooltip": {"trigger": "item", "axisPointer": {"type": "shadow"}},
        "grid": {"bottom": "22%", "top": "12%", "left": "10%", "right": "10%", "containLabel": True},
        "xAxis": {"type": "category", "data": valid_cols,
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
        "yAxis": {"type": "value"},
        "series": [{"name": "Boxplot", "type": "boxplot", "data": box_data}],
    }
    return ChartConfig(
        chart_type="boxplot",
        title="Numeric Column Box Plots",
        description="Box-and-whisker plots for numeric columns",
        config=config,
    )


def _scatter_top_correlated(df: pl.DataFrame, num_cols: list[str]) -> list[ChartConfig]:
    """Scatter plots for the top 3 most correlated pairs."""
    if len(num_cols) < 2:
        return []
    sub = df.select(num_cols).drop_nulls()
    if sub.height < 5:
        return []

    pairs: list[tuple[str, str, float]] = []
    for i in range(len(num_cols)):
        for j in range(i + 1, len(num_cols)):
            r = sub.select(pl.corr(num_cols[i], num_cols[j])).item()
            if r is not None and math.isfinite(r):
                pairs.append((num_cols[i], num_cols[j], abs(r)))
    pairs.sort(key=lambda x: x[2], reverse=True)

    charts: list[ChartConfig] = []
    for c1, c2, r in pairs[:3]:
        sample = sub.select([c1, c2]).sample(min(500, sub.height), shuffle=True)
        data = [[_safe(row[0]), _safe(row[1])] for row in sample.iter_rows()]
        config: dict[str, Any] = {
            "tooltip": {"trigger": "item"},
            "grid": {"bottom": "18%", "top": "12%", "left": "12%", "right": "12%", "containLabel": True},
            "xAxis": {"type": "value", "name": c1, "scale": True, "nameLocation": "middle", "nameGap": 25},
            "yAxis": {"type": "value", "name": c2, "scale": True, "nameLocation": "middle", "nameGap": 35},
            "series": [{
                "name": f"{c1} vs {c2}",
                "type": "scatter",
                "data": data,
                "symbolSize": 6,
                "itemStyle": {"opacity": 0.6},
            }],
        }
        charts.append(ChartConfig(
            chart_type="scatter",
            title=f"{c1} vs {c2} (r={r:.3f})",
            description=f"Scatter plot of the two columns with Pearson r = {r:.3f}",
            config=config,
        ))
    return charts


def _bar_categorical(df: pl.DataFrame, col: str, top_n: int = 20) -> ChartConfig:
    """Bar chart for a categorical column's top N values."""
    vc = df[col].drop_nulls().cast(pl.Utf8).value_counts().sort("count", descending=True).head(top_n)
    labels = [str(row[col]) for row in vc.iter_rows(named=True)]
    values = [int(row["count"]) for row in vc.iter_rows(named=True)]

    config: dict[str, Any] = {
        "tooltip": {"trigger": "axis", "axisPointer": {"type": "shadow"}},
        "grid": {"bottom": "22%", "top": "12%", "left": "10%", "right": "10%", "containLabel": True},
        "xAxis": {"type": "category", "data": labels,
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
        "yAxis": {"type": "value", "name": "Count"},
        "series": [{"name": col, "type": "bar", "data": values,
                    "itemStyle": {"color": "#91cc75"}}],
    }
    return ChartConfig(
        chart_type="bar",
        title=f"Top Values in {col}",
        description=f"Frequency of top {min(top_n, len(labels))} categories in {col}",
        config=config,
    )


def _pie_categorical(df: pl.DataFrame, col: str) -> ChartConfig:
    """Pie chart for a low-cardinality categorical column."""
    vc = df[col].drop_nulls().cast(pl.Utf8).value_counts().sort("count", descending=True).head(10)
    data = [{"value": int(row["count"]), "name": str(row[col])} for row in vc.iter_rows(named=True)]

    config: dict[str, Any] = {
        "tooltip": {"trigger": "item", "formatter": "{b}: {c} ({d}%)"},
        "legend": {"orient": "vertical", "left": "left"},
        "series": [{
            "name": col,
            "type": "pie",
            "radius": ["40%", "70%"],
            "avoidLabelOverlap": True,
            "itemStyle": {"borderRadius": 4, "borderColor": "#fff", "borderWidth": 2},
            "label": {"show": True, "formatter": "{b}: {d}%"},
            "data": data,
        }],
    }
    return ChartConfig(
        chart_type="pie",
        title=f"Distribution of {col}",
        description=f"Proportional breakdown of categories in {col}",
        config=config,
    )


def _treemap_categorical(df: pl.DataFrame, col: str) -> ChartConfig:
    """Treemap for a categorical column."""
    vc = df[col].drop_nulls().cast(pl.Utf8).value_counts().sort("count", descending=True).head(30)
    data = [{"name": str(row[col]), "value": int(row["count"])} for row in vc.iter_rows(named=True)]

    config: dict[str, Any] = {
        "tooltip": {"formatter": "{b}: {c}"},
        "series": [{
            "name": col,
            "type": "treemap",
            "data": data,
            "label": {"show": True, "formatter": "{b}"},
            "breadcrumb": {"show": False},
        }],
    }
    return ChartConfig(
        chart_type="treemap",
        title=f"Treemap of {col}",
        description=f"Hierarchical view of category sizes in {col}",
        config=config,
    )


def _time_trend(df: pl.DataFrame, date_col: str, num_cols: list[str]) -> list[ChartConfig]:
    """Line charts showing trends over time."""
    charts: list[ChartConfig] = []
    try:
        sorted_df = df.sort(date_col)
    except Exception:
        return charts

    dates = sorted_df[date_col].drop_nulls()
    if dates.len() < 5:
        return charts

    date_strs = [str(d) for d in dates.to_list()]

    for col in num_cols[:5]:  # limit
        values = [_safe(v) for v in sorted_df[col].to_list()[:len(date_strs)]]
        config: dict[str, Any] = {
            "tooltip": {"trigger": "axis"},
            "grid": {"bottom": "22%", "top": "12%", "left": "10%", "right": "10%", "containLabel": True},
            "xAxis": {"type": "category", "data": date_strs,
                       "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
            "yAxis": {"type": "value", "name": col},
            "dataZoom": [{"type": "inside"}, {"type": "slider"}],
            "series": [{
                "name": col, "type": "line", "data": values,
                "smooth": True,
                "lineStyle": {"width": 2},
                "areaStyle": {"opacity": 0.15},
            }],
        }
        charts.append(ChartConfig(
            chart_type="line",
            title=f"{col} Over Time",
            description=f"Trend of {col} across {date_col}",
            config=config,
        ))
    return charts


def _heatmap_crosstab(df: pl.DataFrame, cat_cols: list[str]) -> ChartConfig | None:
    """Heatmap for cross-tabulation of two categorical columns."""
    if len(cat_cols) < 2:
        return None
    c1, c2 = cat_cols[0], cat_cols[1]
    # Only use low-cardinality columns
    if df[c1].n_unique() > 15 or df[c2].n_unique() > 15:
        return None

    cross = (
        df.select([c1, c2])
        .drop_nulls()
        .group_by([c1, c2])
        .len()
    )
    x_vals = sorted(set(str(v) for v in cross[c1].to_list()))
    y_vals = sorted(set(str(v) for v in cross[c2].to_list()))
    x_map = {v: i for i, v in enumerate(x_vals)}
    y_map = {v: i for i, v in enumerate(y_vals)}

    data = []
    for row in cross.iter_rows(named=True):
        data.append([x_map[str(row[c1])], y_map[str(row[c2])], int(row["len"])])

    config: dict[str, Any] = {
        "tooltip": {"position": "top"},
        "grid": {"bottom": "22%", "top": "12%", "left": "15%", "right": "5%", "containLabel": True},
        "xAxis": {"type": "category", "data": x_vals, "splitArea": {"show": True},
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80}},
        "yAxis": {"type": "category", "data": y_vals, "splitArea": {"show": True}},
        "visualMap": {"min": 0, "max": max(d[2] for d in data) if data else 1,
                      "calculable": True, "orient": "horizontal",
                      "left": "center", "bottom": "0%"},
        "series": [{"name": "Count", "type": "heatmap", "data": data,
                    "label": {"show": True}}],
    }
    return ChartConfig(
        chart_type="heatmap",
        title=f"{c1} × {c2} Cross-tabulation",
        description=f"Heatmap showing the count at each combination of {c1} and {c2}",
        config=config,
    )


# ── Public API ────────────────────────────────────────────────────────────────


def generate_charts(file_path: str, file_type: str) -> list[ChartConfig]:
    """Automatically generate a suite of ECharts configurations for the dataset."""
    df = _load_dataframe(file_path, file_type)
    charts: list[ChartConfig] = []

    num = _numeric_cols(df)
    cat = _categorical_cols(df)
    dt = _datetime_cols(df)

    # Correlation heatmap
    corr = _correlation_heatmap(df, num)
    if corr:
        charts.append(corr)

    # Histograms (limit to 6)
    for col in num[:6]:
        charts.append(_histogram(df, col))

    # Boxplots
    bp = _boxplot(df, num)
    if bp:
        charts.append(bp)

    # Scatter – top correlated pairs
    charts.extend(_scatter_top_correlated(df, num))

    # Bar charts for categorical
    for col in cat[:5]:
        charts.append(_bar_categorical(df, col))

    # Pie charts for low-cardinality
    for col in cat:
        if df[col].n_unique() <= 10:
            charts.append(_pie_categorical(df, col))
            if len(charts) > 25:
                break

    # Treemap for first high-cardinality categorical
    for col in cat:
        if 10 < df[col].n_unique() <= 50:
            charts.append(_treemap_categorical(df, col))
            break

    # Cross-tabulation heatmap
    ct = _heatmap_crosstab(df, cat)
    if ct:
        charts.append(ct)

    # Time trends
    for dc in dt:
        charts.extend(_time_trend(df, dc, num))

    return charts


run_eda = generate_charts

