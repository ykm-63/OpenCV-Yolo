from __future__ import annotations

import argparse
from pathlib import Path

import cv2

from config import ROOT_DIR


DEFAULT_LABEL_DIR = ROOT_DIR / "dataset" / "labels" / "train"


def convert_xyxy_to_yolo(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    image_width: int,
    image_height: int,
) -> tuple[float, float, float, float]:
    x_min, x_max = sorted((x1, x2))
    y_min, y_max = sorted((y1, y2))

    x_center = ((x_min + x_max) / 2) / image_width
    y_center = ((y_min + y_max) / 2) / image_height
    width = (x_max - x_min) / image_width
    height = (y_max - y_min) / image_height

    return x_center, y_center, width, height


def get_image_size(image_path: Path) -> tuple[int, int]:
    image = cv2.imread(str(image_path))
    if image is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")

    height, width = image.shape[:2]
    return width, height


def write_yolo_label(
    image_path: Path,
    class_id: int,
    box: tuple[float, float, float, float],
    label_dir: Path = DEFAULT_LABEL_DIR,
    append: bool = False,
) -> Path:
    image_path = Path(image_path)
    label_dir = Path(label_dir)
    label_dir.mkdir(parents=True, exist_ok=True)

    image_width, image_height = get_image_size(image_path)
    x_center, y_center, width, height = convert_xyxy_to_yolo(
        box[0],
        box[1],
        box[2],
        box[3],
        image_width,
        image_height,
    )

    label_path = label_dir / f"{image_path.stem}.txt"
    mode = "a" if append else "w"
    with label_path.open(mode, encoding="utf-8") as file:
        file.write(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n")

    print(f"Saved YOLO label: {label_path}")
    return label_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a YOLO txt label from one pixel bounding box."
    )
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--class-id", type=int, required=True)
    parser.add_argument(
        "--box",
        type=float,
        nargs=4,
        metavar=("X1", "Y1", "X2", "Y2"),
        required=True,
        help="Pixel bounding box coordinates.",
    )
    parser.add_argument("--label-dir", type=Path, default=DEFAULT_LABEL_DIR)
    parser.add_argument("--append", action="store_true", help="Append another box to the txt file.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    write_yolo_label(args.image, args.class_id, tuple(args.box), args.label_dir, args.append)
