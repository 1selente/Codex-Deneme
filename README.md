# BIST Signal Lab

A free/open-source-first research and paper-trading project for Borsa Istanbul stocks.

## Safety boundary

This project **does not connect to Midas or any broker** and **cannot place real orders**.
It produces research signals, records paper trades and can send explanatory Telegram notifications.
The human user remains the only execution decision-maker.

## Initial scope

- Python
- Daily (1D) completed bars
- Yahoo Finance/yfinance adapter for research use
- Starter liquid BIST watchlist using `.IS` symbols; point-in-time BIST100 membership is a later research phase
- Transparent pandas/numpy indicators
- Deterministic starter strategy
- SQLite signal/paper-trade journal
- Telegram notifications
- Pytest + GitHub Actions CI
- No paid API, no runtime LLM API, no paid hosting dependency

## Quick start

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

Copy `.env.example` to `.env` locally and add Telegram credentials only when you are ready to test alerts.

## Commands

```bash
python scripts/run_daily_scan.py --dry-run
python scripts/resolve_outcomes.py
python scripts/health_check.py
```

See `docs/` for assumptions, data policy and backtest rules.
