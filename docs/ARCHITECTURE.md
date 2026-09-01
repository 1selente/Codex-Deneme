# Architecture

```text
market data -> validation -> indicators -> strategy -> paper journal -> Telegram
                    |             |
                    +---- fail closed
```

## Components

- `market_data.py`: provider abstraction and yfinance adapter.
- `validation.py`: OHLCV integrity/staleness checks.
- `indicators.py`: transparent deterministic indicators.
- `strategy.py`: versioned signal rules.
- `paper.py`: next-bar/slippage simulation helpers.
- `storage.py`: SQLite journal and idempotency.
- `notify.py`: Telegram message formatting/sending.
- `scripts/`: operational entry points.

There is intentionally no broker/execution layer.
