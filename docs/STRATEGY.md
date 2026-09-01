# Strategy Registry

## starter_pullback_v1

Research baseline only; not investment advice.

For a symbol at completed daily bar D0, emit a LONG candidate only if all are true:

1. `Close > SMA50`
2. `abs(Close - EMA20) / EMA20 <= 0.025`
3. `40 <= RSI14 <= 50`
4. `Volume / SMA20(Volume) >= 0.8`
5. at least 100 bars are available

No parameter optimization is permitted for v1 before the baseline evaluation is recorded.

A candidate is a research signal, not an instruction to trade.
