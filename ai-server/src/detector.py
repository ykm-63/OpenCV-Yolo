from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from ultralytics import YOLO

from config import DETECTED_OUTPUT_DIR, RAW_IMAGE_DIR, ensure_project_dirs


DEFAULT_MODEL = "yolov8n.pt"
DEFAULT_IMAGE = RAW_IMAGE_DIR / "test.png"


def build_detection_response(result, model: YOLO, image_path: Path, result_image_path: Path) -> dict:
    analyzed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    grouped: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"count": 0, "confidence_sum": 0.0}
    )

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        item_name = model.names[class_id]

        grouped[item_name]["count"] += 1
        grouped[item_name]["confidence_sum"] += confidence

    detections = []
    for item_name, values in grouped.items():
        count = int(values["count"])
        confidence = float(values["confidence_sum"]) / count if count > 0 else 0.0
        detections.append(
            {
                "item_name": item_name,
                "count": count,
                "confidence": round(confidence, 4),
                "image_filename": image_path.name,
                "analyzed_at": analyzed_at,
                "result_image_path": str(result_image_path).replace("\\", "/"),
            }
        )

    return {"detections": detections}


def detect_image(
    model: YOLO,
    image_path: Path = DEFAULT_IMAGE,
    output_dir: Path = DETECTED_OUTPUT_DIR,
    confidence_threshold: float = 0.25,
) -> dict:
    ensure_project_dirs()

    if not image_path.exists():
        raise FileNotFoundError(
            f"Input image not found: {image_path}. Put a color image at data/images/raw/test.png."
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    result_image_path = output_dir / f"{image_path.stem}_result.jpg"
    result_json_path = output_dir / f"{image_path.stem}_detections.json"

    results = model(str(image_path), conf=confidence_threshold)
    result = results[0]
    result.save(filename=str(result_image_path))

    response = build_detection_response(result, model, image_path, result_image_path)
    result_json_path.write_text(
        json.dumps(response, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(json.dumps(response, ensure_ascii=False, indent=2))
    print(f"Saved result image: {result_image_path}")
    print(f"Saved result JSON: {result_json_path}")
    return response


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run YOLO detection for one image.")
    parser.add_argument("--image", type=Path, default=DEFAULT_IMAGE)
    parser.add_argument("--output-dir", type=Path, default=DETECTED_OUTPUT_DIR)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Minimum confidence threshold for detections.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    yolo_model = YOLO(args.model)
    detect_image(
        model=yolo_model,
        image_path=args.image,
        output_dir=args.output_dir,
        confidence_threshold=args.conf,
    )
