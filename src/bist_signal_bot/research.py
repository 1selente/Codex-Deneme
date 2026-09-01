from __future__ import annotations

from dataclasses import asdict

import pandas as pd

from .paper import (
    forward_return,
    next_bar_open,
    outcome_target_position,
    simulate_long_entry,
)
from .strategy import historical_candidates


def historical_signal_outcomes(
    df: pd.DataFrame,
    *,
    symbol: str,
    strategy_cfg: dict,
    horizons: list[int],
    slippage_bps: float,
    commission_bps: float,
) -> pd.DataFrame:
    """
    Event-study style baseline.

    Signals use completed D0 features, fill at next eligible bar open, and D1/D3/etc.
    are closes of the 1st/3rd/etc. trading session beginning with the entry session.
    """
    rows: list[dict] = []
    index_to_pos = {ts: pos for pos, ts in enumerate(df.index)}

    for candidate in historical_candidates(df, symbol=symbol, cfg=strategy_cfg):
        try:
            fill_time, raw_open = next_bar_open(df, candidate.bar_time)
        except LookupError:
            continue

        fill = simulate_long_entry(
            raw_open,
            slippage_bps=slippage_bps,
            commission_bps=commission_bps,
        )
        fill_pos = index_to_pos[fill_time]

        base = {
            "symbol": symbol,
            "strategy_version": candidate.strategy_version,
            "signal_time": candidate.bar_time,
            "signal_close": candidate.signal_price,
            "fill_time": fill_time,
            "raw_open": fill.raw_open,
            "fill_price": fill.fill_price,
            "slippage_bps": fill.slippage_bps,
            "commission_bps": fill.commission_bps,
            "rsi14": candidate.indicators["RSI14"],
            "ema_distance": candidate.indicators["EMA_DISTANCE"],
            "volume_ratio": candidate.indicators["VOLUME_RATIO"],
        }

        for horizon in horizons:
            target_pos = outcome_target_position(fill_pos, int(horizon))
            if target_pos >= len(df):
                continue
            window = df.iloc[fill_pos : target_pos + 1]
            target = df.iloc[target_pos]
            row = dict(base)
            row.update(
                {
                    "horizon_days": int(horizon),
                    "target_time": df.index[target_pos],
                    "return_value": forward_return(fill.fill_price, float(target["Close"])),
                    "mfe": float(window["High"].max() / fill.fill_price - 1.0),
                    "mae": float(window["Low"].min() / fill.fill_price - 1.0),
                }
            )
            rows.append(row)

    return pd.DataFrame(rows)


def summarize_outcomes(outcomes: pd.DataFrame) -> pd.DataFrame:
    if outcomes.empty:
        return pd.DataFrame(
            columns=[
                "horizon_days",
                "trades",
                "mean_return",
                "median_return",
                "win_rate",
                "mean_mfe",
                "mean_mae",
            ]
        )

    grouped = outcomes.groupby("horizon_days", sort=True)
    summary = grouped.agg(
        trades=("return_value", "count"),
        mean_return=("return_value", "mean"),
        median_return=("return_value", "median"),
        mean_mfe=("mfe", "mean"),
        mean_mae=("mae", "mean"),
    ).reset_index()
    wins = grouped["return_value"].apply(lambda s: float((s > 0).mean())).rename("win_rate")
    return summary.merge(wins, on="horizon_days")
