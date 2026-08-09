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
from sklearn.neighbors import NearestNeighbors
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
        arr_full = df[col].to_numpy()
        valid_mask = ~np.isnan(arr_full)
        if np.count_nonzero(valid_mask) < 10:
            continue

        arr = arr_full[valid_mask]
        orig_indices = np.where(valid_mask)[0]
        mean = np.mean(arr)
        std = np.std(arr)

        if std == 0:
            continue

        # Z-score check
        z_scores = (arr - mean) / std
        extreme_mask = np.abs(z_scores) > 3.5

        if np.any(extreme_mask):
            # Report up to 5 extreme outliers
            for pos in np.where(extreme_mask)[0][:5]:
                orig_row_idx = int(orig_indices[pos])
                val = arr[pos]
                z_val = z_scores[pos]
                confidence = float(min(0.99, abs(z_val) / 5.0))
                anomalies.append(
                    AnomalyItem(
                        entity_type="row",
                        entity_id=str(orig_row_idx + 1),
                        row_index=orig_row_idx,
                        column_name=col,
                        value=float(val),
                        z_score=float(z_val),
                        confidence_score=round(confidence, 2),
                        description=f"Outlier in column '{col}' with a value of {val} (Z-score: {z_val:.2f}).",
                        severity="critical" if abs(z_val) > 4.5 else "warning",
                        detection_method="Z-Score",
                        reason=f"The value is {abs(z_val):.1f} standard deviations away from the mean ({mean:.2f}).",
                        affected_columns=[col],
                    )
                )

    # 3. Multivariate Outliers (Isolation Forest)
    # Numeric rows without nulls are used for the model; NaN rows are excluded
    X_full = df.select(numeric_cols).to_numpy()
    valid_mask = ~np.isnan(X_full).any(axis=1)
    if np.count_nonzero(valid_mask) >= 15:
        try:
            X = X_full[valid_mask]
            orig_rows = np.where(valid_mask)[0]
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # Fit Isolation Forest
            # contamination specifies the expected proportion of outliers (e.g. 2%)
            clf = IsolationForest(contamination=0.02, random_state=42, n_estimators=100)
            preds = clf.fit_predict(X_scaled)  # -1 represents outlier, 1 is normal
            scores = clf.decision_function(X_scaled)  # lower score -> more anomalous

            outlier_indices = np.where(preds == -1)[0]
            for idx in outlier_indices[:5]:
                orig_row_idx = int(orig_rows[idx])
                confidence = float(min(0.99, max(0.5, -scores[idx])))
                anomalies.append(
                    AnomalyItem(
                        entity_type="row",
                        entity_id=str(orig_row_idx + 1),
                        row_index=orig_row_idx,
                        confidence_score=round(confidence, 2),
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
    if len(numeric_cols) >= 2 and np.count_nonzero(valid_mask) >= 20:
        try:
            X = X_full[valid_mask][:, :3]
            orig_rows = np.where(valid_mask)[0]
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # DBSCAN labels -1 as noise (anomalies)
            db = DBSCAN(eps=1.5, min_samples=5)
            db.fit(X_scaled)

            noise_idx = np.where(db.labels_ == -1)[0]
            # Avoid duplicating anomalies. If already flagged by Isolation Forest, skip or add if space permits
            current_ids = {a.entity_id for a in anomalies}

            # Distance to the nearest core point -> confidence that the row is isolated
            if db.core_sample_indices_.size > 0:
                nn = NearestNeighbors(n_neighbors=1)
                nn.fit(X_scaled[db.core_sample_indices_])
                noise_dists, _ = nn.kneighbors(X_scaled[noise_idx])
            else:
                noise_dists = np.zeros((len(noise_idx), 1))

            for j, idx in enumerate(noise_idx):
                orig_row_idx = int(orig_rows[idx])
                str_id = str(orig_row_idx + 1)
                if str_id not in current_ids and len(anomalies) < 15:
                    confidence = float(min(0.95, max(0.5, noise_dists[j][0] / 3.0)))
                    anomalies.append(
                        AnomalyItem(
                            entity_type="row",
                            entity_id=str_id,
                            row_index=orig_row_idx,
                            confidence_score=round(confidence, 2),
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
