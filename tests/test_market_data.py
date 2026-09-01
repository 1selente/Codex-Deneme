import pytest

from bist_signal_bot.market_data import MarketDataError, YFinanceProvider


def test_intraday_is_rejected_by_mvp_boundary():
    provider = YFinanceProvider()
    with pytest.raises(MarketDataError):
        provider.history("THYAO.IS", interval="15m")
