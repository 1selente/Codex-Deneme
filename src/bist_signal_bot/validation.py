from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

import pandas as pd


REQUIRED_COLUMNS = ("Open", "High", "Low", "Close", "Volume")


class DataQualityError(RuntimeError):
    pass


@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    errors: tuple[str, ...]


def validate_ohlcv(
    df: pd.DataFrame,
    *,
    max_age_hours: float,
    now: datetime | None = None,
) -> ValidationResult:
    errors: list[str] = []

    if df is None or df.empty:
        return ValidationResult(False, ("empty_dataset",))

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        errors.append("missing_columns:" + ",".join(missing))
        return ValidationResult(False, tuple(errors))

    if not isinstance(df.index, pd.DatetimeIndex):
        errors.append("index_not_datetime")
    else:
        if df.index.has_duplicates:
            errors.append("duplicate_timestamps")
        if not df.index.is_monotonic_increasing:
            errors.append("unsorted_timestamps")
        if df.index.tz is None:
            errors.append("timezone_naive_index")

    if df.loc[:, REQUIRED_COLUMNS].isna().any().any():
        errors.append("null_ohlcv")

    numeric = df.loc[:, REQUIRED_COLUMNS]
    if (numeric[["Open", "High", "Low", "Close"]] <= 0).any().any():
        errors.append("nonpositive_price")
    if (numeric["Volume"] < 0).any():
        errors.append("negative_volume")

    invalid_high = numeric["High"] < numeric[["Open", "Low", "Close"]].max(axis=1)
    invalid_low = numeric["Low"] > numeric[["Open", "High", "Close"]].min(axis=1)
    if invalid_high.any():
        errors.append("invalid_high")
    if invalid_low.any():
        errors.append("invalid_low")

    if isinstance(df.index, pd.DatetimeIndex) and df.index.tz is not None:
        reference = now or datetime.now(timezone.utc)
        if reference.tzinfo is None:
            reference = reference.replace(tzinfo=timezone.utc)
        latest = df.index[-1].to_pydatetime()
        age_hours = (reference.astimezone(timezone.utc) - latest.astimezone(timezone.utc)).total_seconds() / 3600
        if age_hours < -1:
            errors.append("latest_bar_in_future")
        elif age_hours > max_age_hours:
            errors.append("stale_data")

    return ValidationResult(not errors, tuple(errors))


def require_valid_ohlcv(df: pd.DataFrame, *, max_age_hours: float, now: datetime | None = None) -> None:
    result = validate_ohlcv(df, max_age_hours=max_age_hours, now=now)
    if not result.ok:
        raise DataQualityError(";".join(result.errors))
