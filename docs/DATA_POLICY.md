# Data Policy

## Primary source
Initial research adapter: Yahoo Finance via `yfinance`. It is not an official Borsa Istanbul feed and must be treated as a convenience research source, not exchange-grade truth.

## Price adjustment
The default configuration uses `auto_adjust=true` for research continuity across corporate actions.
Raw/provider metadata should be retained where practical. Strategy/backtest reports must state the adjustment policy.

## Time
Daily bars are interpreted as market-session bars. Internal operational timestamps are timezone-aware UTC; user-facing times may be rendered in Europe/Istanbul.

## Fail-closed rules
No signal when:
- dataset is empty,
- OHLCV columns are missing,
- duplicate/unsorted timestamps exist,
- OHLC relationships are impossible,
- nulls remain in rows needed for a signal,
- latest bar is stale beyond the configured threshold.

Provider outages do not permit silently reusing old data as if it were current.
