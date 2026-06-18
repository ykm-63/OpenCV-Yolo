# Luma AI Server

OpenCV와 YOLO를 이용해 재고 이미지를 인식하고, Spring Boot 백엔드에 JSON 결과를 전달하기 위한 AI 서버입니다.

현재 기준은 `can` 단일 클래스 테스트입니다. 영상에서 프레임을 추출하고, Roboflow로 라벨링한 뒤 YOLOv8n으로 학습한 모델을 `detector.py`에서 실행하는 흐름까지 확인했습니다.

## Current Status

- `can` 클래스 기준 Roboflow 라벨링 완료
- YOLOv8n 학습 및 `best.pt` 생성 확인
- 테스트 이미지에서 캔 인식 확인
- `detector.py`에서 결과 이미지와 JSON 저장 가능
- `detect_api.py`로 백엔드 연동용 `/api/detect` 임시 API 준비

## Project Structure

```text
ai-server/
  README.md
  requirements.txt
  .gitignore
  src/
    config.py
    main.py
    preprocess.py
    frame_extractor.py
    detector.py
    detect_api.py
    yolo_label_writer.py
  data/
    images/
      raw/
      test/
    videos/
      raw/
  dataset/
    data.yaml
    images/
      train/
      val/
    labels/
      train/
      val/
    raw_frames/
  outputs/
    original/
    processed/
    detected/
  docs/
```

## Folder Roles

| Path | Role |
| --- | --- |
| `src/config.py` | 프로젝트 공통 경로 설정 |
| `src/main.py` | OpenCV 기본 실행 및 흑백 변환 테스트 |
| `src/preprocess.py` | resize, 밝기/대비, blur 등 전처리 실험용 |
| `src/frame_extractor.py` | 영상에서 학습용 이미지 프레임 추출 |
| `src/detector.py` | YOLO 모델로 이미지 탐지, 결과 이미지/JSON 저장 |
| `src/detect_api.py` | Spring Boot가 호출할 FastAPI `/api/detect` 서버 |
| `src/yolo_label_writer.py` | 좌표를 YOLO txt 형식으로 변환하는 보조 도구 |
| `data/images/raw/` | 직접 테스트할 원본 이미지 위치 |
| `data/videos/raw/` | 프레임 추출용 원본 영상 위치 |
| `dataset/images/` | YOLO 학습용 이미지 위치 |
| `dataset/labels/` | YOLO 학습용 txt 라벨 위치 |
| `dataset/data.yaml` | YOLO 클래스 및 학습 경로 설정 |
| `outputs/processed/` | 전처리 결과 이미지 저장 위치 |
| `outputs/detected/` | 탐지 결과 이미지와 JSON 저장 위치 |

## GitHub Data Policy

GitHub에는 코드, 문서, 설정 파일만 올립니다.

올리는 것:

```text
src/
docs/
README.md
requirements.txt
dataset/data.yaml
.gitignore
.gitkeep 파일
```

올리지 않는 것:

```text
원본 이미지
원본 영상
학습 이미지
학습 결과 모델 best.pt
runs/
outputs/
Roboflow 다운로드 zip
```

이미지와 영상은 용량이 크고 개인정보/촬영 환경이 포함될 수 있으므로 GitHub 대신 Google Drive로 공유합니다. GitHub에는 폴더 구조만 `.gitkeep`으로 유지하면 됩니다.

## Install

```bash
pip install -r requirements.txt
```

## Extract Frames From Video

원본 영상을 아래 위치에 넣습니다.

```text
data/videos/raw/can.mp4
```

1초에 1장씩 프레임을 추출합니다.

```bash
python src/frame_extractor.py --video data/videos/raw/can.mp4 --class-name can --fps 1 --resize 640
```

결과는 아래에 저장됩니다.

```text
dataset/raw_frames/can/
```

이후 Roboflow에서 라벨링하고 YOLOv8 형식으로 export합니다.

## Dataset Layout

Roboflow에서 받은 YOLOv8 데이터셋은 아래 구조에 맞춥니다.

```text
dataset/
  images/
    train/
    val/
  labels/
    train/
    val/
  data.yaml
```

이미지와 txt 라벨 파일은 이름이 같아야 합니다.

```text
can_0001_jpg.rf.xxxxx.jpg
can_0001_jpg.rf.xxxxx.txt
```

Roboflow가 붙이는 `.rf.xxxxx` 문자열은 정상입니다.

## Train YOLO

현재는 YOLOv8n 기준으로 진행합니다.

```bash
yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=30 imgsz=640
```

GPU가 있는 환경에서는 다음처럼 실행할 수 있습니다.

```bash
yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=30 imgsz=640 device=0
```

학습 결과 모델은 아래에 생성됩니다.

```text
runs/detect/train/weights/best.pt
```

## Run Detection

테스트 이미지를 아래 위치에 넣습니다.

```text
data/images/raw/test0522.png
```

학습된 모델로 탐지합니다.

```bash
python src/detector.py --model runs/detect/train/weights/best.pt --image data/images/raw/test0522.png
```

결과는 아래에 저장됩니다.

```text
outputs/detected/
```

## Run FastAPI

백엔드 연동 테스트용 임시 API입니다.

```bash
uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000
```

브라우저에서 확인:

```text
http://127.0.0.1:8000/docs
```

같은 네트워크의 핸드폰에서 접속하려면 노트북 IPv4 주소를 사용합니다.

```text
http://노트북IP:8000/docs
```

## API Contract

요청:

```text
POST /api/detect
Content-Type: multipart/form-data
file: image file
```

응답 예시:

```json
{
  "detections": [
    {
      "item_name": "can",
      "count": 1,
      "confidence": 0.92,
      "image_filename": "test0522.png",
      "analyzed_at": "2026-05-23 12:00:00",
      "result_image_path": "outputs/detected/test0522_result.jpg"
    }
  ]
}
```

## Week 5 Goal

- `can` 데이터 추가 수집 및 confidence 개선
- 전처리 전/후 YOLO 결과 비교
- `detect_api.py`에 실제 `best.pt` 연결
- Spring Boot와 `/api/detect` JSON 연동 테스트
- 발표용 테스트 이미지와 백업 결과 준비
