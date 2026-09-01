# Security Policy

## Secrets
Never commit Telegram tokens, chat IDs, API keys, cookies or brokerage credentials.

Use environment variables locally:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

The repository contains only `.env.example`.

## Agent boundary
Coding agents must not receive or add brokerage credentials and must not implement broker execution.

## Telegram
The application is notification-only. A later command interface, if ever added, must use an explicit chat allowlist and must still be unable to place trades.

## Dependencies
Dependencies are bounded in `pyproject.toml`. Dependabot checks Python and GitHub Actions updates.

## Incident response
If a secret is ever committed:
1. revoke/rotate it immediately;
2. remove it from Git history;
3. inspect logs and GitHub Actions output for exposure;
4. do not merely delete the current file and keep using the same token.
