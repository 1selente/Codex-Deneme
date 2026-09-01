from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

from bist_signal_bot.config import load_settings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--settings", default="config/settings.json")
    parser.add_argument("--db", default="data/bist_signal_lab.sqlite3")
    args = parser.parse_args()

    cfg = load_settings(args.settings)
    print(f"config: ok; symbols={len(cfg['universe'])}; strategy={cfg['strategy']['name']}")

    db = Path(args.db)
    if not db.exists():
        print("db: not created yet")
        return 0

    conn = sqlite3.connect(db)
    try:
        signals = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
        fills = conn.execute("SELECT COUNT(*) FROM paper_fills").fetchone()[0]
        outcomes = conn.execute("SELECT COUNT(*) FROM outcomes").fetchone()[0]
        failed = conn.execute(
            "SELECT COUNT(*) FROM notifications WHERE status='failed'"
        ).fetchone()[0]
    finally:
        conn.close()

    print(f"db: signals={signals} fills={fills} outcomes={outcomes} telegram_failed={failed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
