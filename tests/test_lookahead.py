import pandas as pd

from bist_signal_bot.indicators import enrich_indicators


CFG = {
    "sma_trend": 50,
    "ema_pullback": 20,
    "rsi_period": 14,
    "volume_ma": 20,
}


def test_future_rows_cannot_change_past_features(ohlcv):
    base = enrich_indicators(ohlcv, CFG)

    future = ohlcv.iloc[-20:].copy()
    future.index = pd.date_range(
        ohlcv.index[-1] + pd.Timedelta(days=1),
        periods=len(future),
        freq="D",
        tz="UTC",
    )
    future[["Open", "High", "Low", "Close"]] *= 50
    extended = pd.concat([ohlcv, future])

    changed = enrich_indicators(extended, CFG).iloc[: len(ohlcv)]
    pd.testing.assert_frame_equal(base, changed)
