from __future__ import annotations

import os
import base64
import uuid
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO

from .config import DETECTED_OUTPUT_DIR, OUTPUT_DIR, RAW_IMAGE_DIR, ROOT_DIR, ensure_project_dirs


DEFAULT_MODEL_PATH = ROOT_DIR / "runs" / "detect" / "train-6" / "weights" / "best.pt"
MODEL_PATH = Path(os.getenv("YOLO_MODEL_PATH", str(DEFAULT_MODEL_PATH)))
CONFIDENCE_THRESHOLD = float(os.getenv("YOLO_CONF", "0.5"))
INCLUDE_BASE64 = os.getenv("INCLUDE_BASE64", "false").lower() == "true"

app = FastAPI(title="Luma AI Detection API")
ensure_project_dirs()
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

model = YOLO(str(MODEL_PATH))


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_path": str(MODEL_PATH).replace("\\", "/"),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
    }


@app.post("/api/detect")
async def detect(file: UploadFile = File(...)) -> dict:
    original_path = Path(file.filename or "uploaded_image.jpg")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = original_path.stem or "upload"
    suffix = original_path.suffix or ".jpg"
    filename = f"{stem}_{timestamp}_{uuid.uuid4().hex[:6]}{suffix}"

    image_path = RAW_IMAGE_DIR / filename
    image_path.write_bytes(await file.read())

    result_image_path = DETECTED_OUTPUT_DIR / f"{image_path.stem}_result.jpg"

    results = model(str(image_path), conf=CONFIDENCE_THRESHOLD)
    result = results[0]
    result.save(filename=str(result_image_path))

    response = build_detection_response(
        result=result,
        image_path=image_path,
        result_image_path=result_image_path,
    )
    return response


def build_detection_response(result, image_path: Path, result_image_path: Path) -> dict:
    analyzed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    grouped = defaultdict(lambda: {"count": 0, "confidence_sum": 0.0})

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        item_name = result.names[class_id]

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
                "result_image_path": str(result_image_path.relative_to(ROOT_DIR)).replace("\\", "/"),
                "result_image_url": f"/outputs/detected/{result_image_path.name}",
            }
        )
        if INCLUDE_BASE64:
            detections[-1]["result_image_base64"] = image_to_data_url(result_image_path)

    return {"detections": detections}


def image_to_data_url(image_path: Path) -> str:
    encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"
