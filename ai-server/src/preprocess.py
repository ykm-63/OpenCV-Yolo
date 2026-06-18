from __future__ import annotations

import argparse
from pathlib import Path

import cv2

from config import PROCESSED_OUTPUT_DIR, RAW_IMAGE_DIR, ensure_project_dirs


DEFAULT_INPUT_PATH = RAW_IMAGE_DIR / "test.png"
DEFAULT_OUTPUT_PATH = PROCESSED_OUTPUT_DIR / "test_resized.jpg"
YOLO_IMAGE_SIZE = (640, 640)


def preprocess_for_yolo(
    input_path: Path = DEFAULT_INPUT_PATH,
    output_path: Path = DEFAULT_OUTPUT_PATH,
    image_size: tuple[int, int] = YOLO_IMAGE_SIZE,
) -> Path:
    ensure_project_dirs()
    input_path = Path(input_path)
    output_path = Path(output_path)

    image = cv2.imread(str(input_path))
    if image is None:
        raise FileNotFoundError(f"Could not read image: {input_path}")

    resized = cv2.resize(image, image_size)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not cv2.imwrite(str(output_path), resized):
        raise OSError(f"Could not save image: {output_path}")

    print(f"Saved resized image: {output_path}")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Resize one image for YOLO input testing.")
    parser.add_argument("--image", type=Path, default=DEFAULT_INPUT_PATH)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    parser.add_argument("--size", type=int, default=640)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    preprocess_for_yolo(args.image, args.output, (args.size, args.size))
