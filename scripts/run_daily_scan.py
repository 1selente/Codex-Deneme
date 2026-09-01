from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from bist_signal_bot.config import load_settings
from bist_signal_bot.market_data import MarketDataError, YFinanceProvider
from bist_signal_bot.notify import format_signal_message, send_telegram_message
from bist_signal_bot.storage import Journal
from bist_signal_bot.strategy import evaluate_starter_pullback
from bist_signal_bot.util import dataframe_hash, signal_uuid
from bist_signal_bot.validation import DataQualityError, require_valid_ohlcv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--settings", default="config/settings.json")
    parser.add_argument("--db", default="data/bist_signal_lab.sqlite3")
    args = parser.parse_args()

    cfg = load_settings(args.settings)
    provider = YFinanceProvider(timezone=cfg["timezone"])
    journal = None if args.dry_run else Journal(Path(args.db))
    observed_at = datetime.now(timezone.utc).isoformat()
    paper_cfg = cfg["paper"]

    signals = 0
    failures = 0

    for symbol in cfg["universe"]:
        try:
            df = provider.history(
                symbol,
                period=cfg["history_period"],
                interval=cfg["interval"],
                auto_adjust=bool(cfg["auto_adjust"]),
            )
            require_valid_ohlcv(
                df,
                max_age_hours=float(cfg["max_data_age_hours"]),
            )
            candidate = evaluate_starter_pullback(
                df,
                symbol=symbol,
                cfg=cfg["strategy"],
            )
            if candidate is None:
                print(f"{symbol}: no signal")
                continue

            sid = signal_uuid(
                strategy_version=candidate.strategy_version,
                symbol=candidate.symbol,
                timeframe=cfg["interval"],
                bar_time=candidate.bar_time.isoformat(),
                signal_type=candidate.signal_type,
            )
            text = format_signal_message(
                candidate,
                signal_id=sid,
                provider="Yahoo Finance/yfinance",
                slippage_bps=float(paper_cfg["slippage_bps"]),
            )

            if args.dry_run:
                print(text)
                signals += 1
                continue

            assert journal is not None
            inserted = journal.insert_signal(
                signal_uuid=sid,
                candidate=candidate,
                observed_at=observed_at,
                timeframe=cfg["interval"],
                data_source="yfinance",
                data_hash=dataframe_hash(df),
            )
            if not inserted:
                print(f"{symbol}: duplicate signal skipped")
                continue

            try:
                asyncio.run(send_telegram_message(text))
            except Exception as exc:
                journal.record_notification(
                    sid,
                    datetime.now(timezone.utc).isoformat(),
                    "failed",
                    type(exc).__name__,
                )
                print(f"{symbol}: signal stored, Telegram failed: {type(exc).__name__}")
            else:
                journal.record_notification(
                    sid,
                    datetime.now(timezone.utc).isoformat(),
                    "sent",
                )
                print(f"{symbol}: signal stored and Telegram sent")
            signals += 1

        except (MarketDataError, DataQualityError, ValueError) as exc:
            failures += 1
            print(f"{symbol}: FAIL CLOSED: {exc}")

    print(f"scan complete: signals={signals} failures={failures}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
