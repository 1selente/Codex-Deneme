from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import pandas as pd


CANONICAL_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]


class MarketDataError(RuntimeError):
    pass


class MarketDataProvider(Protocol):
    def history(self, symbol: str, period: str, interval: str, auto_adjust: bool) -> pd.DataFrame:
        ...


@dataclass
class YFinanceProvider:
    timezone: str = "Europe/Istanbul"

    def history(self, symbol: str, period: str = "5y", interval: str = "1d", auto_adjust: bool = True) -> pd.DataFrame:
        if interval != "1d":
            raise MarketDataError("MVP intentionally supports only completed daily bars")
        try:
            import yfinance as yf
        except ImportError as exc:
            raise MarketDataError("yfinance is not installed") from exc

        try:
            raw = yf.download(
                symbol,
                period=period,
                interval=interval,
                auto_adjust=auto_adjust,
                progress=False,
                actions=False,
                threads=False,
            )
        except Exception as exc:
            raise MarketDataError(f"provider failure for {symbol}: {exc}") from exc

        if raw is None or raw.empty:
            raise MarketDataError(f"empty dataset for {symbol}")

        if isinstance(raw.columns, pd.MultiIndex):
            # yfinance may return (Price, Ticker) even for a single ticker.
            if symbol in raw.columns.get_level_values(-1):
                raw = raw.xs(symbol, axis=1, level=-1)
            else:
                raw.columns = raw.columns.get_level_values(0)

        missing = [c for c in CANONICAL_COLUMNS if c not in raw.columns]
        if missing:
            raise MarketDataError(f"provider returned missing columns for {symbol}: {missing}")

        out = raw.loc[:, CANONICAL_COLUMNS].copy()
        idx = pd.DatetimeIndex(out.index)
        if idx.tz is None:
            idx = idx.tz_localize(self.timezone)
        idx = idx.tz_convert("UTC")
        out.index = idx
        out.index.name = "timestamp"
        return out.sort_index()
