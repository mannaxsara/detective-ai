"""
Statistical analysis service for DetectiveAI.
Uses SciPy and statsmodels to run hypothesis tests (correlation, ANOVA, t-test, regression, normality).
"""

from __future__ import annotations

from typing import Any
import numpy as np
import polars as pl
from scipy import stats
import statsmodels.api as sm
from app.schemas.analysis import StatisticalTest
from app.services.profiling_service import _load_dataframe

def _safe_float(val: Any) -> float:
    """Ensure value is a standard JSON-compatible float."""
    if val is None:
        return 0.0
    try:
        f = float(val)
        return f if np.isfinite(f) else 0.0
    except (TypeError, ValueError):
        return 0.0

def run_statistics(file_path: str, file_type: str) -> list[StatisticalTest]:
    """Run all appropriate statistical tests on the dataset."""
    try:
        df = _load_dataframe(file_path, file_type)
    except Exception:
        return []

    if df.height < 5:
        return []

    results: list[StatisticalTest] = []
    columns = df.columns

    # Separate numeric and categorical columns
    numeric_cols: list[str] = []
    categorical_cols: list[str] = []

    for col in columns:
        dtype = df[col].dtype
        if dtype.is_numeric():
            numeric_cols.append(col)
        elif dtype == pl.Utf8:
            categorical_cols.append(col)

    # 1. Normality Test (Shapiro-Wilk)
    # Check normality of the first few numeric columns (up to 5000 samples for Shapiro)
    shapiro_cols = numeric_cols[:2]
    for col in shapiro_cols:
        series = df[col].drop_nulls().head(min(df.height, 5000))
        if len(series) >= 5:
            try:
                stat, p_val = stats.shapiro(series.to_numpy())
                stat = _safe_float(stat)
                p_val = _safe_float(p_val)
                significant = p_val < 0.05
                interpretation = (
                    f"The p-value ({p_val:.4f}) is {'less' if significant else 'greater'} than 0.05. "
                    f"Therefore, we {'reject' if significant else 'fail to reject'} the hypothesis of normality. "
                    f"The column '{col}' is {'not ' if significant else ''}normally distributed."
                )
                results.append(
                    StatisticalTest(
                        test_name=f"Shapiro-Wilk Normality Test ({col})",
                        description="Tests the null hypothesis that the data was drawn from a normal distribution.",
                        statistic=stat,
                        p_value=p_val,
                        interpretation=interpretation,
                        significant=significant,
                    )
                )
            except Exception:
                pass

    # 2. Correlation Analysis
    if len(numeric_cols) >= 2:
        col1 = numeric_cols[0]
        col2 = numeric_cols[1]
        s1 = df[col1]
        s2 = df[col2]
        # Align series to remove nulls
        aligned = df.select([col1, col2]).drop_nulls()
        if aligned.height >= 5:
            try:
                stat, p_val = stats.pearsonr(aligned[col1].to_numpy(), aligned[col2].to_numpy())
                stat = _safe_float(stat)
                p_val = _safe_float(p_val)
                significant = p_val < 0.05
                strength = "strong" if abs(stat) > 0.5 else ("moderate" if abs(stat) > 0.3 else "weak")
                interpretation = (
                    f"Pearson correlation coefficient is {stat:.3f} (p-value={p_val:.4f}). "
                    f"There is a statistically {'significant' if significant else 'insignificant'} "
                    f"{strength} {'positive' if stat > 0 else 'negative'} linear correlation between '{col1}' and '{col2}'."
                )
                results.append(
                    StatisticalTest(
                        test_name=f"Pearson Correlation ({col1} vs {col2})",
                        description="Measures the linear correlation between two numeric variables.",
                        statistic=stat,
                        p_value=p_val,
                        interpretation=interpretation,
                        significant=significant,
                    )
                )
            except Exception:
                pass

    # 3. Two-Sample T-Test or ANOVA
    # If we have a categorical column with 2-10 unique values and a numeric column
    target_cat = None
    for col in categorical_cols:
        try:
            uc = df[col].n_unique()
            if 2 <= uc <= 8:
                target_cat = col
                break
        except Exception:
            pass

    if target_cat and len(numeric_cols) >= 1:
        target_num = numeric_cols[0]
        try:
            # Group data by category
            categories = df[target_cat].drop_nulls().unique().to_list()
            groups = []
            for cat in categories:
                g_data = df.filter(pl.col(target_cat) == cat)[target_num].drop_nulls().to_numpy()
                if len(g_data) >= 3:
                    groups.append(g_data)

            if len(groups) == 2:
                # Run t-test
                stat, p_val = stats.ttest_ind(groups[0], groups[1], equal_var=False)
                stat = _safe_float(stat)
                p_val = _safe_float(p_val)
                significant = p_val < 0.05
                interpretation = (
                    f"Two-sample independent t-test (t={stat:.3f}, p-value={p_val:.4f}). "
                    f"The difference in means of '{target_num}' between groups of '{target_cat}' is "
                    f"{'statistically significant' if significant else 'not statistically significant'}."
                )
                results.append(
                    StatisticalTest(
                        test_name=f"Independent T-Test ({target_num} by {target_cat})",
                        description="Compares the means of two independent groups.",
                        statistic=stat,
                        p_value=p_val,
                        interpretation=interpretation,
                        significant=significant,
                    )
                )
            elif len(groups) > 2:
                # Run ANOVA
                stat, p_val = stats.f_oneway(*groups)
                stat = _safe_float(stat)
                p_val = _safe_float(p_val)
                significant = p_val < 0.05
                interpretation = (
                    f"One-way ANOVA test (F={stat:.3f}, p-value={p_val:.4f}). "
                    f"The differences in means of '{target_num}' across groups of '{target_cat}' are "
                    f"{'statistically significant' if significant else 'not statistically significant'}."
                )
                results.append(
                    StatisticalTest(
                        test_name=f"One-way ANOVA ({target_num} by {target_cat})",
                        description="Tests whether the means of three or more groups are equal.",
                        statistic=stat,
                        p_value=p_val,
                        interpretation=interpretation,
                        significant=significant,
                    )
                )
        except Exception:
            pass

    # 4. Simple Linear Regression
    if len(numeric_cols) >= 2:
        y_col = numeric_cols[0]
        x_col = numeric_cols[1]
        try:
            aligned = df.select([x_col, y_col]).drop_nulls()
            if aligned.height >= 10:
                X = aligned[x_col].to_numpy()
                y = aligned[y_col].to_numpy()
                # Add constant
                X_const = sm.add_constant(X)
                model = sm.OLS(y, X_const).fit()
                
                coef = model.params[1]
                p_val = model.pvalues[1]
                r2 = model.rsquared

                coef = _safe_float(coef)
                p_val = _safe_float(p_val)
                r2 = _safe_float(r2)
                
                significant = p_val < 0.05
                interpretation = (
                    f"OLS Regression: Y = {model.params[0]:.2f} + {coef:.2f} * X. "
                    f"R² coefficient of determination is {r2:.3f}. "
                    f"The independent variable '{x_col}' is a {'significant' if significant else 'non-significant'} "
                    f"predictor of '{y_col}' (p-value={p_val:.4f})."
                )
                results.append(
                    StatisticalTest(
                        test_name=f"Linear Regression ({y_col} ~ {x_col})",
                        description="Models the relationship between a dependent variable and one independent variable.",
                        statistic=r2,
                        p_value=p_val,
                        interpretation=interpretation,
                        significant=significant,
                    )
                )
        except Exception:
            pass

    # Fallback if no statistical tests could be run
    if len(results) == 0:
        results.append(
            StatisticalTest(
                test_name="No Statistical Tests",
                description="Unable to auto-select and run tests due to insufficient rows or columns.",
                statistic=0.0,
                p_value=1.0,
                interpretation="Please upload a dataset containing at least 5 rows and numeric/categorical columns.",
                significant=False,
            )
        )

    return results
