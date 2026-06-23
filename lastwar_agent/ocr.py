from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any, Dict

from .macos import ROOT, compile_swift_helper


OCR_SWIFT = ROOT / "tools" / "macos_ocr.swift"
OCR_BIN = ROOT / ".lastwar_agent" / "bin" / "macos_ocr"


def compile_ocr_helper() -> Path:
    return compile_swift_helper(OCR_SWIFT, OCR_BIN)


def ocr_image(image_path: Path) -> Dict[str, Any]:
    if not image_path.exists():
        raise ValueError(f"image does not exist: {image_path}")
    helper = compile_ocr_helper()
    result = subprocess.run([str(helper), str(image_path)], text=True, capture_output=True, check=True)
    payload = json.loads(result.stdout)
    text = payload.get("text")
    if not isinstance(text, list):
        payload["text"] = []
    payload["text_joined"] = "\n".join(str(item) for item in payload["text"])
    return payload
