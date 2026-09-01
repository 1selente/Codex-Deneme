---
name: regression-review
description: Independent final gate for code changes.
---
# Regression Review

Review the git diff, run deterministic tests, inspect architecture/safety boundaries and verify financial assumptions did not drift.

Specifically reject:
- broker/execution code
- runtime paid AI dependencies
- removed fail-closed behavior
- weakened lookahead/OOS tests
- committed secrets

Report risks even when tests pass.
