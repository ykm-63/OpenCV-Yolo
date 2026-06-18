from __future__ import annotations

import argparse
import re
from pathlib import Path

import cv2
import numpy as np

from config import RAW_VIDEO_DIR, ROOT_DIR


DEFAULT_VIDEO_PATH = RAW_VIDEO_DIR / "sample.mp4"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "dataset" / "raw_frames"


def resize_with_letterbox(image: np.ndarray, target_size: int) -> np.ndarray:
    """Resize an image to a square while keeping the original aspect ratio."""
    if target_size <= 0:
        raise ValueError("resize size must be greater than 0")

    height, width = image.shape[:2]
    scale = target_size / max(height, width)
    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)

    pad_width = target_size - new_width
    pad_height = target_size - new_height
    top = pad_height // 2
    bottom = pad_height - top
    left = pad_width // 2
    right = pad_width - left

    return cv2.copyMakeBorder(
        resized,
        top,
        bottom,
        left,
        right,
        cv2.BORDER_CONSTANT,
        value=[0, 0, 0],
    )


def extract_frames(
    video_path: Path,
    output_dir: Path,
    class_name: str,
    frames_per_second: float = 1.0,
    resize: int | None = None,
) -> int:
    if frames_per_second <= 0:
        raise ValueError("fps must be greater than 0")

    video_path = Path(video_path)
    output_dir = Path(output_dir) / class_name
    output_dir.mkdir(parents=True, exist_ok=True)
    existing_indexes = [
        int(match.group(1))
        for path in output_dir.glob(f"{class_name}_*.jpg")
        if (match := re.match(rf"^{re.escape(class_name)}_(\d+)\.jpg$", path.name))
    ]
    next_index = max(existing_indexes, default=0) + 1

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise FileNotFoundError(f"Could not open video: {video_path}")

    source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_step = max(int(source_fps / frames_per_second), 1)

    saved_count = 0
    target_frame_index = 0

    while target_frame_index < total_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_index)
        ok, frame = cap.read()
        if not ok:
            break

        if resize:
            frame = resize_with_letterbox(frame, resize)

        output_path = output_dir / f"{class_name}_{next_index + saved_count:04d}.jpg"
        if not cv2.imwrite(str(output_path), frame):
            raise OSError(f"Could not save frame: {output_path}")

        saved_count += 1
        target_frame_index += frame_step

    cap.release()
    print(f"Saved {saved_count} frames to {output_dir}")
    return saved_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract training images from a video.")
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO_PATH)
    parser.add_argument("--class-name", required=True)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--fps", type=float, default=1.0, help="Frames to save per second.")
    parser.add_argument("--resize", type=int, default=None, help="Optional square resize size.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    extract_frames(args.video, args.output_dir, args.class_name, args.fps, args.resize)
