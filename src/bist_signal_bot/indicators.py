from __future__ import annotations

import numpy as np
import pandas as pd


def sma(series: pd.Series, period: int) -> pd.Series:
    return series.rolling(period, min_periods=period).mean()


def ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False, min_periods=period).mean()


def rsi_wilder(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False, min_periods=period).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False, min_periods=period).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    rsi = rsi.where(avg_loss != 0, 100.0)
    rsi = rsi.where(avg_gain != 0, 0.0)
    both_zero = (avg_gain == 0) & (avg_loss == 0)
    return rsi.where(~both_zero, 50.0)


def atr_wilder(df: pd.DataFrame, period: int = 14) -> pd.Series:
    prev_close = df["Close"].shift(1)
    tr = pd.concat(
        [
            df["High"] - df["Low"],
            (df["High"] - prev_close).abs(),
            (df["Low"] - prev_close).abs(),
        ],
        axis=1,
    ).max(axis=1)
    return tr.ewm(alpha=1 / period, adjust=False, min_periods=period).mean()


def enrich_indicators(df: pd.DataFrame, strategy_cfg: dict) -> pd.DataFrame:
    out = df.copy()
    out["SMA50"] = sma(out["Close"], int(strategy_cfg["sma_trend"]))
    out["EMA20"] = ema(out["Close"], int(strategy_cfg["ema_pullback"]))
    out["RSI14"] = rsi_wilder(out["Close"], int(strategy_cfg["rsi_period"]))
    out["ATR14"] = atr_wilder(out, 14)
    vol_ma_period = int(strategy_cfg["volume_ma"])
    out["VOL_MA20"] = sma(out["Volume"], vol_ma_period)
    out["VOLUME_RATIO"] = out["Volume"] / out["VOL_MA20"].replace(0, np.nan)
    return out
