import numpy as np
import pandas as pd

from bist_signal_bot.indicators import atr_wilder, ema, rsi_wilder, sma


def test_sma_known_series():
    s = pd.Series([1.0, 2.0, 3.0, 4.0])
    out = sma(s, 3)
    assert np.isnan(out.iloc[1])
    assert out.iloc[2] == 2.0
    assert out.iloc[3] == 3.0


def test_ema_is_causal():
    s = pd.Series(np.arange(1.0, 30.0))
    a = ema(s, 5)
    changed_future = pd.concat([s, pd.Series([10000.0, -10000.0])], ignore_index=True)
    b = ema(changed_future, 5)
    pd.testing.assert_series_equal(a, b.iloc[: len(a)].reset_index(drop=True), check_names=False)


def test_rsi_rising_series_reaches_100():
    s = pd.Series(np.arange(1.0, 40.0))
    out = rsi_wilder(s, 14)
    assert out.iloc[-1] == 100.0


def test_atr_positive(ohlcv):
    out = atr_wilder(ohlcv, 14)
    assert out.dropna().iloc[-1] > 0
