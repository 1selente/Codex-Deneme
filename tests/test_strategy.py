from bist_signal_bot.strategy import evaluate_starter_pullback


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


def test_all_conditions_required(monkeypatch, ohlcv):
    enriched = ohlcv.copy()
    enriched["SMA50"] = 120.0
    enriched["EMA20"] = 149.0
    enriched["RSI14"] = 45.0
    enriched["ATR14"] = 3.0
    enriched["VOLUME_RATIO"] = 1.1

    def fake_enrich(df, cfg):
        return enriched

    monkeypatch.setattr("bist_signal_bot.strategy.enrich_indicators", fake_enrich)
    signal = evaluate_starter_pullback(ohlcv, symbol="TEST.IS", cfg=CFG)
    assert signal is not None
    assert signal.conditions_met == 4

    enriched.loc[enriched.index[-1], "RSI14"] = 60.0
    assert evaluate_starter_pullback(ohlcv, symbol="TEST.IS", cfg=CFG) is None
