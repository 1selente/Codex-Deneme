# Backtest Protocol

1. Completed bars only.
2. Signal on D0 may fill no earlier than D1 open.
3. Commission default may be 0 bps, but slippage stress must be evaluated.
4. Required slippage stress grid: 0/5/10/25/50 bps.
5. Separate train, validation and locked OOS periods before tuning.
6. Never optimize against locked OOS.
7. Compare to an explicit benchmark.
8. Report trade count, total return, CAGR, max drawdown, Sharpe/Sortino where meaningful, profit factor, expectancy, win rate, average win/loss.
9. Investigate look-ahead, survivorship, selection bias, data snooping, corporate actions and liquidity limitations.
10. Parameter neighborhood stability matters more than a single best historical point.
11. A strategy version is immutable after locked-OOS evaluation; changes create a new version.
