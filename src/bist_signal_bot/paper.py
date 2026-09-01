from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


@dataclass(frozen=True)
class PaperFill:
    raw_open: float
    fill_price: float
    slippage_bps: float
    commission_bps: float


def next_bar_open(df: pd.DataFrame, signal_time: pd.Timestamp) -> tuple[pd.Timestamp, float]:
    """Return the first available bar strictly after the signal bar."""
    later = df.loc[df.index > signal_time]
    if later.empty:
        raise LookupError("no eligible bar exists after signal")
    ts = later.index[0]
    return ts, float(later.iloc[0]["Open"])


def simulate_long_entry(
    next_bar_open_price: float,
    *,
    slippage_bps: float,
    commission_bps: float = 0.0,
) -> PaperFill:
    if next_bar_open_price <= 0:
        raise ValueError("next_bar_open_price must be positive")
    if slippage_bps < 0 or commission_bps < 0:
        raise ValueError("cost assumptions cannot be negative")

    fill = next_bar_open_price * (1 + slippage_bps / 10_000)
    fill *= 1 + commission_bps / 10_000
    return PaperFill(
        raw_open=float(next_bar_open_price),
        fill_price=float(fill),
        slippage_bps=float(slippage_bps),
        commission_bps=float(commission_bps),
    )


def outcome_target_position(fill_pos: int, horizon_days: int) -> int:
    """D1 means the close of the entry session; D3 is the third session close."""
    if horizon_days < 1:
        raise ValueError("horizon_days must be >= 1")
    return fill_pos + horizon_days - 1


def forward_return(entry_price: float, future_close: float) -> float:
    if entry_price <= 0:
        raise ValueError("entry_price must be positive")
    return float(future_close / entry_price - 1.0)
