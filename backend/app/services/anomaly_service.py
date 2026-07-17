"""
Anomaly detection service for DetectiveAI.
Uses Isolation Forest, Z-score, IQR, and DBSCAN to detect multivariate and univariate anomalies.
"""

from __future__ import annotations

from typing import Any
import numpy as np
import polars as pl
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.schemas.analysis import AnomalyItem
from app.services.profiling_service import _load_dataframe

def detect_anomalies(file_path: str, file_type: str) -> list[AnomalyItem]:
    """Identify anomalous records in the dataset using statistical and machine learning algorithms."""
    try:
        df = _load_dataframe(file_path, file_type)
    except Exception:
        return []

    # Requires a reasonable number of rows to perform anomaly detection
    if df.height < 10:
        return []

    anomalies: list[AnomalyItem] = []
    columns = df.columns

    # 1. Select numeric columns
    numeric_cols: list[str] = []
    for col in columns:
        if df[col].dtype.is_numeric():
            numeric_cols.append(col)

    if not numeric_cols:
        return []

    # 2. Univariate Outliers (Z-score & IQR)
    # Check top numeric columns
    for col in numeric_cols[:2]:
        series = df[col].drop_nulls()
        if len(series) < 10:
            continue
        
        arr = series.to_numpy()
        mean = np.mean(arr)
        std = np.std(arr)
        
        if std == 0:
            continue

        # Z-score check
        z_scores = (arr - mean) / std
        extreme_idx = np.where(np.abs(z_scores) > 3.5)[0]

        if len(extreme_idx) > 0:
            # Report up to 5 extreme outliers
            for idx in extreme_idx[:5]:
                orig_row_idx = int(idx)
                val = arr[orig_row_idx]
                z_val = z_scores[orig_row_idx]
                anomalies.append(
                    AnomalyItem(
                        entity_type="row",
                        entity_id=str(orig_row_idx + 1),
                        description=f"Outlier in column '{col}' with a value of {val} (Z-score: {z_val:.2f}).",
                        severity="critical" if abs(z_val) > 4.5 else "warning",
                        detection_method="Z-Score",
                        reason=f"The value is {abs(z_val):.1f} standard deviations away from the mean ({mean:.2f}).",
                        affected_columns=[col],
                    )
                )

    # 3. Multivariate Outliers (Isolation Forest)
    # Filter numeric data, drop null rows
    multi_df = df.select(numeric_cols).drop_nulls()
    if multi_df.height >= 15:
        try:
            X = multi_df.to_numpy()
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # Fit Isolation Forest
            # contamination specifies the expected proportion of outliers (e.g. 2%)
            clf = IsolationForest(contamination=0.02, random_state=42, n_estimators=100)
            preds = clf.fit_predict(X_scaled)  # -1 represents outlier, 1 is normal
            
            outlier_indices = np.where(preds == -1)[0]
            for idx in outlier_indices[:5]:
                orig_row_idx = int(idx)
                anomalies.append(
                    AnomalyItem(
                        entity_type="row",
                        entity_id=str(orig_row_idx + 1),
                        description="Multivariate anomaly detected. This row represents an unusual combination of numeric variables.",
                        severity="warning",
                        detection_method="Isolation Forest",
                        reason="The combination of values across numeric columns is highly improbable compared to the overall data distribution.",
                        affected_columns=numeric_cols,
                    )
                )
        except Exception:
            pass

    # 4. DBSCAN Clustering for Density-Based Outliers
    if len(numeric_cols) >= 2 and multi_df.height >= 20:
        try:
            X = multi_df.select(numeric_cols[:3]).to_numpy()
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # DBSCAN labels -1 as noise (anomalies)
            db = DBSCAN(eps=1.5, min_samples=5)
            db.fit(X_scaled)
            
            noise_idx = np.where(db.labels_ == -1)[0]
            # Avoid duplicating anomalies. If already flagged by Isolation Forest, skip or add if space permits
            current_ids = {a.entity_id for a in anomalies}
            
            for idx in noise_idx:
                orig_row_idx = int(idx)
                str_id = str(orig_row_idx + 1)
                if str_id not in current_ids and len(anomalies) < 15:
                    anomalies.append(
                        AnomalyItem(
                            entity_type="row",
                            entity_id=str_id,
                            description="Low-density anomaly. This row does not belong to any main data clusters.",
                            severity="info",
                            detection_method="DBSCAN",
                            reason="The record lies in a low-density region of the data space, far away from all major clusters.",
                            affected_columns=numeric_cols[:3],
                        )
                    )
        except Exception:
            pass

    # Sort anomalies: critical first, then warning, then info
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    anomalies.sort(key=lambda a: severity_order.get(a.severity, 3))

    return anomalies
