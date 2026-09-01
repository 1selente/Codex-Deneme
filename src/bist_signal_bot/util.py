from __future__ import annotations

import hashlib
import json
from typing import Any

import pandas as pd


def dataframe_hash(df: pd.DataFrame) -> str:
    payload = pd.util.hash_pandas_object(df, index=True).values.tobytes()
    return hashlib.sha256(payload).hexdigest()


def signal_uuid(*, strategy_version: str, symbol: str, timeframe: str, bar_time: str, signal_type: str) -> str:
    raw = json.dumps(
        {
            "strategy_version": strategy_version,
            "symbol": symbol,
            "timeframe": timeframe,
            "bar_time": bar_time,
            "signal_type": signal_type,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
