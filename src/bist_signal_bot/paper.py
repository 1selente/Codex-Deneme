from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PaperFill:
    raw_open: float
    fill_price: float
    slippage_bps: float
    commission_bps: float


def simulate_long_entry(next_bar_open: float, *, slippage_bps: float, commission_bps: float = 0.0) -> PaperFill:
    if next_bar_open <= 0:
        raise ValueError("next_bar_open must be positive")
    if slippage_bps < 0 or commission_bps < 0:
        raise ValueError("cost assumptions cannot be negative")

    fill = next_bar_open * (1 + slippage_bps / 10_000)
    fill *= 1 + commission_bps / 10_000
    return PaperFill(
        raw_open=float(next_bar_open),
        fill_price=float(fill),
        slippage_bps=float(slippage_bps),
        commission_bps=float(commission_bps),
    )


def forward_return(entry_price: float, future_close: float) -> float:
    if entry_price <= 0:
        raise ValueError("entry_price must be positive")
    return float(future_close / entry_price - 1.0)
