# BIST Signal Lab — Agent Contract

These rules are mandatory for any coding agent working in this repository.

## Hard safety boundary
1. Never add Midas integration.
2. Never add a broker API.
3. Never place, submit, prepare, automate or execute a real-money order.
4. Telegram is notification-only.
5. Human review is required before any real-world trade.

## Financial research integrity
6. Use completed bars only.
7. Data-quality failure means fail closed: no signal.
8. Never silently reuse stale market data.
9. A signal computed from D0 close cannot fill before the next eligible bar.
10. Never use future rows to compute past features, signals or fills.
11. Strategy changes require a new explicit version.
12. Never tune on a period described as locked OOS.
13. Never silently change slippage, fees, benchmark, execution timing or adjusted-price assumptions.
14. Midas commission may be configured as 0, but backtests must still support slippage stress cases.
15. Do not claim predictive probability or expected profit without a validated statistical model.

## Engineering
16. No strategy code without tests.
17. Run tests; never claim success because an LLM says so.
18. Prefer deterministic Python/pandas/SQLite logic over LLM calls.
19. Runtime must not require OpenAI/Claude/other paid AI APIs.
20. Keep dependencies minimal and pinned by bounded version ranges.
21. Secrets must never be committed; use environment variables.
22. Logs must not print secrets.
23. Production logic must live in src/, not notebooks.
24. Keep context scoped: read only the docs/skills relevant to the task.

## Workflow
SPEC -> IMPLEMENT -> TEST -> AUDIT -> REPORT -> COMMIT

Use the narrow skill under `.agents/skills/` that matches the task. Avoid agent swarms and orchestration frameworks unless a measured need appears.
