# AI Server

Python FastAPI와 YOLO 모델을 이용해 업로드된 이미지를 분석하는 AI 서버입니다.

Spring Boot 백엔드가 이미지를 `POST /api/detect`로 전달하면, 이 서버가 YOLO 모델로 객체를 탐지하고 탐지 결과 JSON과 결과 이미지 경로를 반환합니다.

## 실행 방법

```powershell
cd C:\dev\opencv-inventory-Luma\ai-server
pip install -r requirements.txt
uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000
```

브라우저 확인:

```text
http://127.0.0.1:8000/health
```

## 모델 위치

기본 모델 경로는 아래와 같습니다.

```text
ai-server/runs/detect/train-6/weights/best.pt
```

`runs/`와 `*.pt` 모델 파일은 용량이 커서 GitHub에는 포함하지 않습니다. 실행할 때는 로컬에 해당 모델 파일이 있어야 합니다.

환경변수로 모델 경로와 confidence를 바꿀 수 있습니다.

```powershell
$env:YOLO_MODEL_PATH="runs/detect/train-6/weights/best.pt"
$env:YOLO_CONF="0.5"
```

## API

| 메서드 | URL | 기능 |
| --- | --- | --- |
| `GET` | `/health` | 서버 상태, 모델 경로, confidence 확인 |
| `POST` | `/api/detect` | 이미지 파일을 받아 YOLO 분석 실행 |

`POST /api/detect` 요청 형식:

```text
Content-Type: multipart/form-data
file: image file
```

응답 예시:

```json
{
  "detections": [
    {
      "item_name": "double_outlet",
      "count": 1,
      "confidence": 0.92,
      "image_filename": "sample.jpg",
      "analyzed_at": "2026-06-18 10:00:00",
      "result_image_path": "outputs/detected/sample_result.jpg",
      "result_image_url": "/outputs/detected/sample_result.jpg"
    }
  ]
}
```

## 주요 코드 역할

| 파일 | 기능 | 사용 방법 |
| --- | --- | --- |
| `src/detect_api.py` | 실제 서비스에서 사용하는 FastAPI YOLO 분석 서버 | `uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000` |
| `src/detector.py` | API 없이 이미지 1장을 직접 YOLO로 테스트하는 단독 실행 코드 | `python src/detector.py --model runs/detect/train-6/weights/best.pt --image data/images/raw/test.jpg` |
| `src/config.py` | 프로젝트 공통 경로 설정 및 폴더 생성 함수 | 다른 Python 코드에서 import해서 사용 |
| `src/preprocess.py` | YOLO 입력 테스트용 이미지 resize 전처리 | `python src/preprocess.py --image data/images/raw/test.jpg --output outputs/processed/test_resized.jpg` |
| `src/frame_extractor.py` | 동영상에서 학습용 이미지 프레임 추출 | `python src/frame_extractor.py --video data/videos/raw/sample.mp4 --class-name double_outlet --fps 1 --resize 640` |
| `src/yolo_label_writer.py` | 픽셀 좌표를 YOLO txt 라벨 형식으로 변환 | `python src/yolo_label_writer.py --image data/images/raw/test.jpg --class-id 1 --box 10 20 300 400` |
| `src/main.py` | OpenCV 동작 확인 및 흑백 변환 테스트용 초기 코드 | `python src/main.py` 또는 `python src/main.py --image data/images/raw/test.jpg` |

## 데이터셋

학습 클래스는 `dataset/data.yaml` 기준입니다.

| class id | class name |
| --- | --- |
| `0` | `empty_plate` |
| `1` | `double_outlet` |
| `2` | `switch_single_outlet` |
| `3` | `media_port` |
| `4` | `multi_switch` |

이미지와 라벨 전체는 용량 문제로 GitHub에 포함하지 않습니다.

## 폴더 역할

| 경로 | 역할 |
| --- | --- |
| `src/` | FastAPI, YOLO 실행, 전처리, 라벨 보조 코드 |
| `dataset/data.yaml` | YOLO 학습 클래스 및 train/val 경로 설정 |
| `data/images/raw/` | 분석할 원본 이미지 저장 위치 |
| `data/videos/raw/` | 프레임 추출용 원본 영상 위치 |
| `outputs/detected/` | YOLO 결과 이미지와 JSON 저장 위치 |
| `runs/` | YOLO 학습 결과 폴더, GitHub 제외 |

