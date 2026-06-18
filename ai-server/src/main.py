import argparse
from pathlib import Path

import cv2

from config import (
    DETECTED_OUTPUT_DIR,
    ORIGINAL_OUTPUT_DIR,
    PROCESSED_OUTPUT_DIR,
    RAW_IMAGE_DIR,
    RAW_VIDEO_DIR,
    TEST_IMAGE_DIR,
    ensure_project_dirs,
)


def show_project_status() -> None:
    ensure_project_dirs()

    print("OpenCV project is ready.")
    print(f"OpenCV version: {cv2.__version__}")
    print(f"Raw image folder: {RAW_IMAGE_DIR}")
    print(f"Test image folder: {TEST_IMAGE_DIR}")
    print(f"Raw video folder: {RAW_VIDEO_DIR}")
    print(f"Original output folder: {ORIGINAL_OUTPUT_DIR}")
    print(f"Processed output folder: {PROCESSED_OUTPUT_DIR}")
    print(f"Detected output folder: {DETECTED_OUTPUT_DIR}")


def convert_to_gray(input_path: Path, output_path: Path) -> None:
    image = cv2.imread(str(input_path))

    if image is None:
        raise FileNotFoundError(f"Could not read image: {input_path}")

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), gray_image)

    print(f"Saved grayscale image: {output_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="OpenCV project starter")
    parser.add_argument(
        "--image",
        type=Path,
        help="Path to an image file to convert to grayscale.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=PROCESSED_OUTPUT_DIR / "gray_output.jpg",
        help="Path where the processed image will be saved.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.image:
        convert_to_gray(args.image, args.output)
    else:
        show_project_status()


if __name__ == "__main__":
    main()
