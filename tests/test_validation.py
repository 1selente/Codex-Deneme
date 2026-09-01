from datetime import datetime, timezone

from bist_signal_bot.validation import validate_ohlcv


def test_valid_ohlcv(ohlcv):
    now = datetime(2026, 6, 10, tzinfo=timezone.utc)
    result = validate_ohlcv(ohlcv, max_age_hours=24 * 200, now=now)
    assert result.ok


def test_invalid_high_is_rejected(ohlcv):
    bad = ohlcv.copy()
    bad.iloc[-1, bad.columns.get_loc("High")] = bad.iloc[-1]["Close"] - 5
    result = validate_ohlcv(
        bad,
        max_age_hours=24 * 200,
        now=datetime(2026, 6, 10, tzinfo=timezone.utc),
    )
    assert not result.ok
    assert "invalid_high" in result.errors


def test_stale_data_is_rejected(ohlcv):
    result = validate_ohlcv(
        ohlcv,
        max_age_hours=1,
        now=datetime(2026, 12, 1, tzinfo=timezone.utc),
    )
    assert not result.ok
    assert "stale_data" in result.errors
