# Decisions

## ADR-001 — Human-in-the-loop execution
No broker integration. Telegram notification -> human review -> optional manual action in Midas.

## ADR-002 — Free-first runtime
Use open-source Python libraries and local/self-host execution. No paid market API is required for MVP.

## ADR-003 — Daily bars first
Start with daily completed bars to keep validation and backtesting auditable. Intraday may be added later with an archival pipeline.

## ADR-004 — Deterministic baseline before ML
No LSTM/Transformer/XGBoost/LLM predictor until deterministic baselines, OOS tests and forward paper trading establish a trustworthy evaluation harness.
