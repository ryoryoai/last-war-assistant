import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from lastwar_agent.ocr import ocr_image


class OCRTests(unittest.TestCase):
    @mock.patch("lastwar_agent.ocr.compile_ocr_helper")
    @mock.patch("lastwar_agent.ocr.subprocess.run")
    def test_ocr_image_parses_payload(self, run_mock, compile_mock):
        with tempfile.TemporaryDirectory() as tmp:
            image = Path(tmp) / "screen.png"
            image.write_bytes(b"png")
            compile_mock.return_value = Path("/tmp/macos_ocr")
            run_mock.return_value.stdout = json.dumps({"text": ["軍拡", "日程"], "items": []})

            result = ocr_image(image)

        self.assertEqual(result["text"], ["軍拡", "日程"])
        self.assertEqual(result["text_joined"], "軍拡\n日程")


if __name__ == "__main__":
    unittest.main()
