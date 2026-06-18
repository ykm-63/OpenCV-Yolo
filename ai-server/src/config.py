from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
IMAGE_DIR = DATA_DIR / "images"
RAW_IMAGE_DIR = IMAGE_DIR / "raw"
TEST_IMAGE_DIR = IMAGE_DIR / "test"
VIDEO_DIR = DATA_DIR / "videos"
RAW_VIDEO_DIR = VIDEO_DIR / "raw"
OUTPUT_DIR = ROOT_DIR / "outputs"
ORIGINAL_OUTPUT_DIR = OUTPUT_DIR / "original"
PROCESSED_OUTPUT_DIR = OUTPUT_DIR / "processed"
DETECTED_OUTPUT_DIR = OUTPUT_DIR / "detected"


def ensure_project_dirs() -> None:
    """Create local-only folders used by the project."""
    for path in (
        DATA_DIR,
        IMAGE_DIR,
        RAW_IMAGE_DIR,
        TEST_IMAGE_DIR,
        VIDEO_DIR,
        RAW_VIDEO_DIR,
        OUTPUT_DIR,
        ORIGINAL_OUTPUT_DIR,
        PROCESSED_OUTPUT_DIR,
        DETECTED_OUTPUT_DIR,
    ):
        path.mkdir(parents=True, exist_ok=True)
