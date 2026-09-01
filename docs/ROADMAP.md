# Roadmap and Exit Gates

## Phase 0 — Repository contract
Status: implemented.
Exit gate:
- no broker execution path
- secrets excluded
- AGENTS.md and narrow skills present
- CI exists

## Phase 1 — Market data foundation
Status: implemented for daily yfinance research adapter.
Exit gate:
- canonical OHLCV
- timezone-aware index
- fail-closed validation
- provider failure cannot create a signal
- deterministic fixtures/tests

## Phase 2 — Deterministic baseline
Status: implemented.
Strategy: starter_pullback_v1.
Exit gate:
- transparent rules
- causal indicators
- no parameter optimization
- strategy version recorded with each signal

## Phase 3 — Historical event study
Status: implemented for starter watchlist.
Exit gate:
- D0 signal -> next eligible bar open
- configurable slippage/commission
- D1/D3/D5/D10 outcomes
- MFE/MAE
- lookahead regression tests

Not yet allowed to call this a historical BIST100 backtest because point-in-time membership data is not implemented.

## Phase 4 — Telegram + forward paper trading
Status: code implemented; credentials/live smoke test still required on the user's machine.
Exit gate:
- Telegram token only in environment
- duplicate signals suppressed
- signal and notification journaled
- paper fill occurs only after next bar exists
- outcomes resolve over time

## Phase 5 — Research integrity upgrades
Required before serious strategy comparison:
- point-in-time BIST100 membership source
- benchmark series
- explicit train/validation/locked-OOS split
- liquidity filters and BIST microstructure assumptions
- stress reports for 0/5/10/25/50 bps slippage
- minimum sample-size policy

## Phase 6 — 24/7-ish zero-cost operations
Primary path: user's own Windows PC.
Required:
- Task Scheduler jobs
- log rotation
- health checks
- provider outage alerts
- restart/recovery instructions
- local database backup

## Phase 7 — Controlled iteration
Only after forward paper data accumulates:
- new hypothesis -> new strategy version
- small parameter neighborhoods only
- never retune old locked OOS
- independent regression/backtest review

## Phase 8 — ML (optional, deferred)
ML is allowed only if:
- deterministic baseline is stable
- point-in-time data is trustworthy
- evaluation harness is frozen
- sufficient samples exist
- ML beats baseline out-of-sample after costs

No LSTM/Transformer/LLM predictor before these gates.
