from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from bist_signal_bot.config import load_settings
from bist_signal_bot.market_data import MarketDataError, YFinanceProvider
from bist_signal_bot.research import historical_signal_outcomes, summarize_outcomes
from bist_signal_bot.validation import DataQualityError, require_valid_ohlcv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--settings", default="config/settings.json")
    parser.add_argument("--output", default="reports/baseline_signal_outcomes.csv")
    args = parser.parse_args()

    cfg = load_settings(args.settings)
    provider = YFinanceProvider(timezone=cfg["timezone"])
    paper = cfg["paper"]
    frames: list[pd.DataFrame] = []

    for symbol in cfg["universe"]:
        try:
            df = provider.history(
                symbol,
                period=cfg["history_period"],
                interval=cfg["interval"],
                auto_adjust=bool(cfg["auto_adjust"]),
            )
            require_valid_ohlcv(df, max_age_hours=float(cfg["max_data_age_hours"]))
        except (MarketDataError, DataQualityError) as exc:
            print(f"{symbol}: skipped: {exc}")
            continue

        outcomes = historical_signal_outcomes(
            df,
            symbol=symbol,
            strategy_cfg=cfg["strategy"],
            horizons=[int(x) for x in paper["outcome_horizons"]],
            slippage_bps=float(paper["slippage_bps"]),
            commission_bps=float(paper["commission_bps"]),
        )
        if not outcomes.empty:
            frames.append(outcomes)
        print(f"{symbol}: outcome rows={len(outcomes)}")

    all_outcomes = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    all_outcomes.to_csv(output, index=False)

    summary = summarize_outcomes(all_outcomes)
    summary_path = output.with_name(output.stem + "_summary.csv")
    summary.to_csv(summary_path, index=False)

    print("\nBaseline event-study summary")
    print(summary.to_string(index=False))
    print("\nIMPORTANT: This starter watchlist is not a point-in-time BIST100 universe.")
    print("Do not treat these results as proof of profitability or as investment advice.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
