from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


def natural_slide_key(name: str) -> tuple[int, str]:
    match = re.search(r"slide(\d+)\.xml$", name)
    return (int(match.group(1)) if match else 10**9, name)


def extract_text(xml_bytes: bytes) -> list[str]:
    root = ET.fromstring(xml_bytes)
    lines: list[str] = []
    for paragraph in root.findall(".//a:p", NS):
        runs = [node.text or "" for node in paragraph.findall(".//a:t", NS)]
        text = "".join(runs).strip()
        if text:
            lines.append(text)
    return lines


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if len(sys.argv) != 2:
        print("Usage: extract_pptx_text.py <deck.pptx>", file=sys.stderr)
        return 2

    deck = Path(sys.argv[1])
    with zipfile.ZipFile(deck) as zf:
        slide_names = sorted(
            [
                name
                for name in zf.namelist()
                if name.startswith("ppt/slides/slide") and name.endswith(".xml")
            ],
            key=natural_slide_key,
        )
        note_names = {
            natural_slide_key(name)[0]: name
            for name in zf.namelist()
            if name.startswith("ppt/notesSlides/notesSlide") and name.endswith(".xml")
        }

        for index, slide_name in enumerate(slide_names, start=1):
            print(f"--- Slide {index} ---")
            for line in extract_text(zf.read(slide_name)):
                print(line)
            notes_name = note_names.get(index)
            if notes_name:
                notes = extract_text(zf.read(notes_name))
                if notes:
                    print("[Notes]")
                    for line in notes:
                        print(line)
            print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
