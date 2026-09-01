from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd

from .indicators import enrich_indicators


@dataclass(frozen=True)
class SignalCandidate:
    symbol: str
    strategy_version: str
    bar_time: pd.Timestamp
    signal_type: str
    signal_price: float
    indicators: dict[str, float]
    reason_codes: tuple[str, ...]
    conditions_met: int
    conditions_total: int


def evaluate_starter_pullback(
    df: pd.DataFrame,
    *,
    symbol: str,
    cfg: dict[str, Any],
) -> SignalCandidate | None:
    warmup = int(cfg["warmup_bars"])
    if len(df) < warmup:
        return None

    x = enrich_indicators(df, cfg)
    row = x.iloc[-1]
    required = ["SMA50", "EMA20", "RSI14", "VOLUME_RATIO", "ATR14"]
    if row[required].isna().any():
        return None

    close = float(row["Close"])
    sma50 = float(row["SMA50"])
    ema20 = float(row["EMA20"])
    rsi = float(row["RSI14"])
    volume_ratio = float(row["VOLUME_RATIO"])
    atr = float(row["ATR14"])
    ema_distance = abs(close - ema20) / ema20 if ema20 else float("inf")

    checks = [
        ("trend_above_sma50", close > sma50),
        ("near_ema20", ema_distance <= float(cfg["ema_distance_max"])),
        ("rsi_pullback_band", float(cfg["rsi_min"]) <= rsi <= float(cfg["rsi_max"])),
        ("volume_filter", volume_ratio >= float(cfg["volume_ratio_min"])),
    ]

    if not all(ok for _, ok in checks):
        return None

    return SignalCandidate(
        symbol=symbol,
        strategy_version=str(cfg["name"]),
        bar_time=x.index[-1],
        signal_type="LONG_CANDIDATE",
        signal_price=close,
        indicators={
            "SMA50": sma50,
            "EMA20": ema20,
            "RSI14": rsi,
            "ATR14": atr,
            "VOLUME_RATIO": volume_ratio,
            "EMA_DISTANCE": ema_distance,
        },
        reason_codes=tuple(name for name, ok in checks if ok),
        conditions_met=sum(1 for _, ok in checks if ok),
        conditions_total=len(checks),
    )
