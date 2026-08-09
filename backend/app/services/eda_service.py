"""
Exploratory Data Analysis (EDA) Service.
Generates automatic ECharts configurations from a Polars DataFrame for UI charts.
"""

from __future__ import annotations

import math
from typing import Any

import polars as pl
from pydantic import BaseModel


class ChartConfig(BaseModel):
    chart_type: str
    title: str
    description: str
    config: dict[str, Any]


def _safe(val: Any) -> Any:
    """Convert non-serializable values (NaN, Inf, etc.) to JSON-compatible types."""
    if val is None:
        return None
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
    return val


def _load_dataframe(file_path: str, file_type: str) -> pl.DataFrame:
    ext = file_type.lower().strip(".")
    if ext == "csv":
        return pl.read_csv(file_path, infer_schema_length=10000, ignore_errors=True)
    if ext in ("xlsx", "xls"):
        return pl.read_excel(file_path)
    if ext == "parquet":
        return pl.read_parquet(file_path)
    if ext == "json":
        return pl.read_json(file_path)
    return pl.read_csv(file_path, infer_schema_length=10000, ignore_errors=True)


def _numeric_cols(df: pl.DataFrame) -> list[str]:
    return [
        col for col, dtype in zip(df.columns, df.dtypes)
        if dtype in (pl.Int8, pl.Int16, pl.Int32, pl.Int64, pl.UInt8, pl.UInt16, pl.UInt32, pl.UInt64, pl.Float32, pl.Float64)
    ]


def _categorical_cols(df: pl.DataFrame) -> list[str]:
    return [
        col for col, dtype in zip(df.columns, df.dtypes)
        if dtype in (pl.Utf8, pl.Categorical)
    ]


def _date_cols(df: pl.DataFrame) -> list[str]:
    return [
        col for col, dtype in zip(df.columns, df.dtypes)
        if dtype in (pl.Date, pl.Datetime)
    ]


# ── Chart Generator Builders ──────────────────────────────────────────────────


def _histogram(df: pl.DataFrame, col: str, bins: int = 15) -> ChartConfig | None:
    """Generate a histogram config for a numeric column."""
    series = df[col].drop_nulls()
    if series.len() < 5:
        return None

    min_val = float(series.min())  # type: ignore[arg-type]
    max_val = float(series.max())  # type: ignore[arg-type]
    if min_val == max_val:
        return None

    bin_width = (max_val - min_val) / bins
    counts = [0] * bins
    bin_labels = []

    for i in range(bins):
        low = min_val + i * bin_width
        high = low + bin_width
        bin_labels.append(f"{low:.1f}-{high:.1f}")

    vals = series.to_list()
    for v in vals:
        if v is None or math.isnan(v):
            continue
        idx = int((v - min_val) / bin_width)
        if idx >= bins:
            idx = bins - 1
        counts[idx] += 1

    config: dict[str, Any] = {
        "tooltip": {"trigger": "axis", "axisPointer": {"type": "shadow"}},
        "grid": {"bottom": "20%", "top": "12%", "left": "12%", "right": "8%", "containLabel": True},
        "xAxis": {
            "type": "category",
            "data": bin_labels,
            "name": col,
            "axisLabel": {"rotate": 35, "interval": "auto", "fontFamily": "monospace"},
        },
        "yAxis": {"type": "value", "name": "Frequency", "axisLabel": {"fontFamily": "monospace"}},
        "series": [{
            "name": col,
            "type": "bar",
            "data": counts,
            "itemStyle": {"color": "#edfe5e", "borderRadius": [4, 4, 0, 0]},
        }],
    }
    return ChartConfig(
        chart_type="histogram",
        title=f"Distribution of {col}",
        description=f"Frequency histogram for numerical column {col}",
        config=config,
    )


def _scatter(df: pl.DataFrame, num_cols: list[str]) -> list[ChartConfig]:
    """Generate scatter plots for pair-wise correlated numeric columns."""
    if len(num_cols) < 2:
        return []

    sub = df.select(num_cols[:6]).drop_nulls()
    if sub.height < 5:
        return []

    pairs: list[tuple[str, str, float]] = []
    cols = sub.columns
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            c1, c2 = cols[i], cols[j]
            try:
                r = float(sub.select(pl.corr(c1, c2)).item())
                if not math.isnan(r):
                    pairs.append((c1, c2, abs(r)))
            except Exception:
                pass

    pairs.sort(key=lambda x: x[2], reverse=True)

    charts: list[ChartConfig] = []
    for c1, c2, r in pairs[:3]:
        sample = sub.select([c1, c2]).sample(min(500, sub.height), shuffle=True)
        data = [[_safe(row[0]), _safe(row[1])] for row in sample.iter_rows()]
        config: dict[str, Any] = {
            "tooltip": {"trigger": "item"},
            "grid": {"bottom": "18%", "top": "12%", "left": "15%", "right": "10%", "containLabel": True},
            "xAxis": {"type": "value", "name": c1, "scale": True, "nameLocation": "middle", "nameGap": 28, "axisLabel": {"fontFamily": "monospace"}},
            "yAxis": {"type": "value", "name": c2, "scale": True, "nameLocation": "end", "nameGap": 12, "axisLabel": {"fontFamily": "monospace"}},
            "series": [{
                "name": f"{c1} vs {c2}",
                "type": "scatter",
                "data": data,
                "symbolSize": 6,
                "itemStyle": {"color": "#31e992", "opacity": 0.75},
            }],
        }
        charts.append(ChartConfig(
            chart_type="scatter",
            title=f"{c1} vs {c2} (r={r:.3f})",
            description=f"Scatter plot of two columns with Pearson r = {r:.3f}",
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
        "grid": {"bottom": "22%", "top": "12%", "left": "12%", "right": "8%", "containLabel": True},
        "xAxis": {"type": "category", "data": labels,
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80, "fontFamily": "monospace"}},
        "yAxis": {"type": "value", "name": "Count", "axisLabel": {"fontFamily": "monospace"}},
        "series": [{"name": col, "type": "bar", "data": values,
                    "itemStyle": {"color": "#edfe5e", "borderRadius": [4, 4, 0, 0]}}],
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
        "legend": {"orient": "vertical", "left": "left", "textStyle": {"fontFamily": "monospace"}},
        "series": [{
            "name": col,
            "type": "pie",
            "radius": ["40%", "70%"],
            "avoidLabelOverlap": True,
            "itemStyle": {"borderRadius": 4, "borderColor": "#181914", "borderWidth": 2},
            "label": {"show": True, "formatter": "{b}: {d}%", "fontFamily": "monospace"},
            "data": data,
        }],
    }
    return ChartConfig(
        chart_type="pie",
        title=f"Distribution of {col}",
        description=f"Proportional breakdown of distinct values in {col}",
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
            "label": {"show": True, "formatter": "{b}", "fontFamily": "monospace"},
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

    for col in num_cols[:3]:
        raw_vals = sorted_df[col].to_list()
        values = [_safe(v) for v in raw_vals]

        config: dict[str, Any] = {
            "tooltip": {"trigger": "axis"},
            "grid": {"bottom": "20%", "top": "12%", "left": "12%", "right": "8%", "containLabel": True},
            "xAxis": {"type": "category", "data": date_strs,
                       "axisLabel": {"rotate": 35, "interval": "auto", "fontFamily": "monospace"}},
            "yAxis": {"type": "value", "name": col, "axisLabel": {"fontFamily": "monospace"}},
            "dataZoom": [{"type": "inside"}, {"type": "slider"}],
            "series": [{
                "name": col, "type": "line", "data": values,
                "smooth": True,
                "lineStyle": {"width": 2, "color": "#edfe5e"},
                "areaStyle": {"opacity": 0.15, "color": "#edfe5e"},
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
                   "axisLabel": {"rotate": 35, "interval": "auto", "overflow": "truncate", "width": 80, "fontFamily": "monospace"}},
        "yAxis": {"type": "category", "data": y_vals, "splitArea": {"show": True}, "axisLabel": {"fontFamily": "monospace"}},
        "visualMap": {"min": 0, "max": max(d[2] for d in data) if data else 1,
                      "calculable": True, "orient": "horizontal",
                      "left": "center", "bottom": "0%"},
        "series": [{"name": "Count", "type": "heatmap", "data": data,
                    "label": {"show": True}}],
    }
    return ChartConfig(
        chart_type="heatmap",
        title=f"{c1} × {c2} Cross-tabulation",
        description=f"Heatmap showing count at each combination of {c1} and {c2}",
        config=config,
    )


# ── Public API ────────────────────────────────────────────────────────────────


def generate_charts(file_path: str, file_type: str) -> list[ChartConfig]:
    """Automatically generate a suite of ECharts configurations for the dataset."""
    df = _load_dataframe(file_path, file_type)
    charts: list[ChartConfig] = []

    num = _numeric_cols(df)
    cat = _categorical_cols(df)
    dates = _date_cols(df)

    # 1. Histograms for up to 3 numeric columns
    for col in num[:3]:
        h = _histogram(df, col)
        if h:
            charts.append(h)

    # 2. Categorical distribution pie & bar charts
    for col in cat[:3]:
        n_unique = df[col].n_unique()
        if n_unique <= 10:
            charts.append(_pie_categorical(df, col))
        elif n_unique <= 30:
            charts.append(_bar_categorical(df, col))
        else:
            charts.append(_treemap_categorical(df, col))

    # 3. Scatter plots for correlated numeric pairs
    scatters = _scatter(df, num)
    charts.extend(scatters)

    # 4. Time series trends if date column exists
    if dates and num:
        trends = _time_trend(df, dates[0], num)
        charts.extend(trends)

    # 5. Cross-tabulation heatmap for low-cardinality categorical pairs
    if len(cat) >= 2:
        hm = _heatmap_crosstab(df, cat)
        if hm:
            charts.append(hm)

    return charts


run_eda = generate_charts
