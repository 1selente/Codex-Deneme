---
name: lookahead-audit
description: Detect future-data leakage in indicators, signals, fills and evaluations.
---
# Lookahead Audit

Use for indicators, strategy logic, backtests and paper fills.

Rules:
- completed D0 data may influence D0 signal only
- D0 signal cannot fill before D1/next eligible bar
- future rows must never change earlier features/signals
- rolling/normalization code must be causal

Require a regression test that mutating future prices cannot change prior outputs.
Do not optimize strategy parameters.
