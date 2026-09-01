from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_settings(path: str | Path = "config/settings.json") -> dict[str, Any]:
    p = Path(path)
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if data.get("interval") != "1d":
        raise ValueError("MVP supports daily bars only")
    return data
