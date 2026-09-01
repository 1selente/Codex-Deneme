---
name: market-data-quality
description: Audit BIST OHLCV ingestion before any signal or backtest consumes it.
---
# Market Data Quality

Use when touching provider adapters, caches, calendars, timestamps or OHLCV normalization.

Must check:
- empty/missing data
- duplicates/order/timezone
- stale or future bars
- impossible OHLC relationships
- nulls and negative volume
- adjusted-price policy

Fail closed. Never turn provider failure into a signal. Do not change strategy rules.
