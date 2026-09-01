from bist_signal_bot.notify import format_signal_message
from bist_signal_bot.strategy import SignalCandidate


def test_message_has_no_execution_claim():
    import pandas as pd

    c = SignalCandidate(
        symbol="THYAO.IS",
        strategy_version="starter_pullback_v1",
        bar_time=pd.Timestamp("2026-09-01", tz="UTC"),
        signal_type="LONG_CANDIDATE",
        signal_price=250.0,
        indicators={
            "SMA50": 240.0,
            "EMA20": 248.0,
            "RSI14": 45.0,
            "ATR14": 5.0,
            "VOLUME_RATIO": 1.2,
            "EMA_DISTANCE": 0.008,
        },
        reason_codes=("a", "b", "c", "d"),
        conditions_met=4,
        conditions_total=4,
    )
    text = format_signal_message(
        c,
        signal_id="abcdef123456789",
        provider="fixture",
        slippage_bps=10,
    )
    assert "Otomatik emir gönderilmedi" in text
    assert "Signal ID: abcdef123456" in text
