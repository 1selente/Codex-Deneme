from datetime import datetime, timezone

from bist_signal_bot.storage import Journal
from bist_signal_bot.strategy import SignalCandidate


def test_signal_insert_is_idempotent(tmp_path):
    journal = Journal(tmp_path / "journal.sqlite3")
    candidate = SignalCandidate(
        symbol="TEST.IS",
        strategy_version="starter_pullback_v1",
        bar_time=__import__("pandas").Timestamp("2026-09-01", tz="UTC"),
        signal_type="LONG_CANDIDATE",
        signal_price=100.0,
        indicators={"RSI14": 45.0},
        reason_codes=("test",),
        conditions_met=1,
        conditions_total=1,
    )
    kwargs = dict(
        signal_uuid="abc",
        candidate=candidate,
        observed_at=datetime.now(timezone.utc).isoformat(),
        timeframe="1d",
        data_source="fixture",
        data_hash="hash",
    )
    assert journal.insert_signal(**kwargs) is True
    assert journal.insert_signal(**kwargs) is False
