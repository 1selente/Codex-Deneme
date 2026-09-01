from __future__ import annotations

import os

from .strategy import SignalCandidate


def format_signal_message(
    candidate: SignalCandidate,
    *,
    signal_id: str,
    provider: str,
    slippage_bps: float,
) -> str:
    i = candidate.indicators
    return (
        f"🟢 BIST ARAŞTIRMA SİNYALİ | {candidate.symbol.replace('.IS', '')}\n\n"
        f"Strateji: {candidate.strategy_version}\n"
        "Timeframe: 1D\n"
        f"Sinyal barı: {candidate.bar_time.isoformat()}\n"
        f"Kapanış fiyatı: {candidate.signal_price:.2f} TL\n\n"
        f"Koşullar: {candidate.conditions_met}/{candidate.conditions_total}\n"
        "• Close > SMA50\n"
        f"• EMA20 mesafe: %{i['EMA_DISTANCE'] * 100:.2f}\n"
        f"• RSI14: {i['RSI14']:.2f}\n"
        f"• Hacim oranı: {i['VOLUME_RATIO']:.2f}\n"
        f"• ATR14: {i['ATR14']:.2f}\n\n"
        "Paper varsayımı: sonraki uygun seans açılışı\n"
        f"Slippage senaryosu: {slippage_bps:.0f} bps\n"
        f"Veri sağlayıcı: {provider}\n"
        f"Signal ID: {signal_id[:12]}\n\n"
        "⚠️ Otomatik emir gönderilmedi. Bu bir araştırma/paper-trading sinyalidir."
    )


async def send_telegram_message(text: str) -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        raise RuntimeError("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required")

    from telegram import Bot

    bot = Bot(token=token)
    async with bot:
        await bot.send_message(chat_id=chat_id, text=text)
