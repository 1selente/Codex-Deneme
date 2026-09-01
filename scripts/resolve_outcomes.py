from __future__ import annotations

import argparse
from datetime import datetime, timezone

from bist_signal_bot.config import load_settings
from bist_signal_bot.market_data import MarketDataError, YFinanceProvider
from bist_signal_bot.paper import (\n    forward_return,\n    next_bar_open,\n    outcome_target_position,\n    simulate_long_entry,\n)
from bist_signal_bot.storage import Journal
from bist_signal_bot.validation import DataQualityError, require_valid_ohlcv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--settings", default="config/settings.json")
    parser.add_argument("--db", default="data/bist_signal_lab.sqlite3")
    args = parser.parse_args()

    cfg = load_settings(args.settings)
    journal = Journal(args.db)
    provider = YFinanceProvider(timezone=cfg["timezone"])
    paper = cfg["paper"]
    horizons = [int(x) for x in paper["outcome_horizons"]]

    with journal.connect() as conn:
        signals = conn.execute(
            """
            SELECT s.*
            FROM signals s
            ORDER BY s.bar_time ASC
            """
        ).fetchall()

    by_symbol: dict[str, object] = {}

    for row in signals:
        symbol = row["symbol"]
        if symbol not in by_symbol:
            try:
                df = provider.history(
                    symbol,
                    period="2y",
                    interval="1d",
                    auto_adjust=bool(cfg["auto_adjust"]),
                )
                require_valid_ohlcv(df, max_age_hours=float(cfg["max_data_age_hours"]))
                by_symbol[symbol] = df
            except (MarketDataError, DataQualityError) as exc:
                print(f"{symbol}: outcome fetch failed closed: {exc}")
                continue

        df = by_symbol[symbol]
        signal_time = __import__("pandas").Timestamp(row["bar_time"])
        try:
            fill_time, raw_open = next_bar_open(df, signal_time)
        except LookupError:
            continue

        fill = simulate_long_entry(
            raw_open,
            slippage_bps=float(paper["slippage_bps"]),
            commission_bps=float(paper["commission_bps"]),
        )
        journal.insert_paper_fill(
            signal_uuid=row["signal_uuid"],
            fill_bar_time=fill_time.isoformat(),
            raw_open=fill.raw_open,
            fill_price=fill.fill_price,
            slippage_bps=fill.slippage_bps,
            commission_bps=fill.commission_bps,
        )

        fill_pos = df.index.get_loc(fill_time)
        if not isinstance(fill_pos, int):
            continue

        for horizon in horizons:
            target_pos = outcome_target_position(fill_pos, horizon)
            if target_pos >= len(df):
                continue
            window = df.iloc[fill_pos : target_pos + 1]
            target_close = float(df.iloc[target_pos]["Close"])
            ret = forward_return(fill.fill_price, target_close)
            mfe = float(window["High"].max() / fill.fill_price - 1.0)
            mae = float(window["Low"].min() / fill.fill_price - 1.0)
            journal.upsert_outcome(
                signal_uuid=row["signal_uuid"],
                horizon_days=horizon,
                return_value=ret,
                mfe=mfe,
                mae=mae,
                resolved_at=datetime.now(timezone.utc).isoformat(),
            )

    print("outcome resolution complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
