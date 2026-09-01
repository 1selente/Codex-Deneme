import pandas as pd

from bist_signal_bot.research import historical_signal_outcomes, summarize_outcomes


CFG = {
    "name": "starter_pullback_v1",
    "warmup_bars": 100,
    "sma_trend": 50,
    "ema_pullback": 20,
    "ema_distance_max": 0.025,
    "rsi_period": 14,
    "rsi_min": 40.0,
    "rsi_max": 50.0,
    "volume_ma": 20,
    "volume_ratio_min": 0.8,
}


def test_historical_outcomes_never_fill_same_bar(monkeypatch, ohlcv):
    from bist_signal_bot.strategy import SignalCandidate

    signal = SignalCandidate(
        symbol="TEST.IS",
        strategy_version="starter_pullback_v1",
        bar_time=ohlcv.index[-3],
        signal_type="LONG_CANDIDATE",
        signal_price=float(ohlcv.iloc[-3]["Close"]),
        indicators={
            "SMA50": 120.0,
            "EMA20": 148.0,
            "RSI14": 45.0,
            "ATR14": 3.0,
            "VOLUME_RATIO": 1.0,
            "EMA_DISTANCE": 0.01,
        },
        reason_codes=("a", "b", "c", "d"),
        conditions_met=4,
        conditions_total=4,
    )
    monkeypatch.setattr(
        "bist_signal_bot.research.historical_candidates",
        lambda *args, **kwargs: [signal],
    )

    out = historical_signal_outcomes(
        ohlcv,
        symbol="TEST.IS",
        strategy_cfg=CFG,
        horizons=[1],
        slippage_bps=0,
        commission_bps=0,
    )
    assert len(out) == 1
    assert out.iloc[0]["fill_time"] == ohlcv.index[-2]
    assert out.iloc[0]["target_time"] == ohlcv.index[-2]


def test_summary_counts_trades():
    df = pd.DataFrame(
        {
            "horizon_days": [1, 1, 3],
            "return_value": [0.1, -0.05, 0.2],
            "mfe": [0.12, 0.01, 0.25],
            "mae": [-0.02, -0.08, -0.01],
        }
    )
    summary = summarize_outcomes(df)
    d1 = summary.loc[summary["horizon_days"] == 1].iloc[0]
    assert d1["trades"] == 2
    assert d1["win_rate"] == 0.5
