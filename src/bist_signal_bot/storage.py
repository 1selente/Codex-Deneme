from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .strategy import SignalCandidate


SCHEMA = """
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS signals (
    signal_uuid TEXT PRIMARY KEY,
    strategy_version TEXT NOT NULL,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    bar_time TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    signal_price REAL NOT NULL,
    indicators_json TEXT NOT NULL,
    reason_codes_json TEXT NOT NULL,
    data_source TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    UNIQUE(strategy_version, symbol, timeframe, bar_time, signal_type)
);

CREATE TABLE IF NOT EXISTS notifications (
    signal_uuid TEXT PRIMARY KEY,
    attempted_at TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    FOREIGN KEY(signal_uuid) REFERENCES signals(signal_uuid)
);

CREATE TABLE IF NOT EXISTS outcomes (
    signal_uuid TEXT NOT NULL,
    horizon_days INTEGER NOT NULL,
    return_value REAL,
    mfe REAL,
    mae REAL,
    resolved_at TEXT,
    PRIMARY KEY(signal_uuid, horizon_days),
    FOREIGN KEY(signal_uuid) REFERENCES signals(signal_uuid)
);
"""


class Journal:
    def __init__(self, path: str | Path):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as conn:
            conn.executescript(SCHEMA)

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def insert_signal(
        self,
        *,
        signal_uuid: str,
        candidate: SignalCandidate,
        observed_at: str,
        timeframe: str,
        data_source: str,
        data_hash: str,
    ) -> bool:
        with self.connect() as conn:
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO signals (
                    signal_uuid, strategy_version, symbol, timeframe, signal_type,
                    bar_time, observed_at, signal_price, indicators_json,
                    reason_codes_json, data_source, data_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    signal_uuid,
                    candidate.strategy_version,
                    candidate.symbol,
                    timeframe,
                    candidate.signal_type,
                    candidate.bar_time.isoformat(),
                    observed_at,
                    candidate.signal_price,
                    json.dumps(candidate.indicators, sort_keys=True),
                    json.dumps(candidate.reason_codes),
                    data_source,
                    data_hash,
                ),
            )
            return cur.rowcount == 1

    def record_notification(self, signal_uuid: str, attempted_at: str, status: str, error: str | None = None) -> None:
        with self.connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO notifications(signal_uuid, attempted_at, status, error)
                VALUES (?, ?, ?, ?)
                """,
                (signal_uuid, attempted_at, status, error),
            )
