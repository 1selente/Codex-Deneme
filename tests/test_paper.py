import pytest

from bist_signal_bot.paper import next_bar_open, outcome_target_position, simulate_long_entry


def test_d1_is_entry_session_close_position():
    assert outcome_target_position(10, 1) == 10
    assert outcome_target_position(10, 3) == 12


def test_slippage_is_applied_to_next_open():
    fill = simulate_long_entry(100.0, slippage_bps=10, commission_bps=0)
    assert fill.fill_price == pytest.approx(100.1)


def test_next_bar_execution_is_strictly_after_signal(ohlcv):
    signal_time = ohlcv.index[-2]
    ts, price = next_bar_open(ohlcv, signal_time)
    assert ts == ohlcv.index[-1]
    assert price == ohlcv.iloc[-1]["Open"]


def test_no_same_bar_fill(ohlcv):
    signal_time = ohlcv.index[-1]
    with pytest.raises(LookupError):
        next_bar_open(ohlcv, signal_time)
