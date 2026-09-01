# Operations

## Daily workflow
1. Fetch daily bars after the session is expected to be complete.
2. Validate every symbol.
3. Skip invalid/stale symbols.
4. Compute indicators on completed bars.
5. Evaluate strategy.
6. Insert signal idempotently.
7. Send Telegram notification only for a newly inserted signal.
8. Record notification outcome.
9. Resolve paper outcomes later.

## Runtime
Primary zero-cost path: the user's own Windows PC using Task Scheduler.

Secrets stay in environment variables. Never store Telegram credentials in Git.
