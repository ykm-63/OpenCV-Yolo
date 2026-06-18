# 3주차 AI 서버 확인 및 정리

## 확인한 내용

- YOLO11 기반 탐지 흐름으로 전환했습니다.
- `src/detector.py`에서 이미지 입력, 모델 선택, 결과 이미지 저장, JSON 저장이 가능합니다.
- 5개 품목 기준 dataset 구조와 `data.yaml`을 구성했습니다.
- 전처리 초안은 `src/preprocess.py`로 정리했습니다.
- 이미지, 학습 결과, 모델 파일은 GitHub가 아니라 Google Drive로 관리하는 것을 권장합니다.

## 현재 class 기준

```yaml
names:
  0: can
  1: pet_bottle
  2: paper_box
  3: pouch
  4: glass_bottle
```

## GitHub에 올리는 것

```text
src/detector.py
src/preprocess.py
src/api-contract.md
dataset/data.yaml
dataset/labels/**/*.txt
docs/
requirements.txt
```

## GitHub에 올리지 않는 것

```text
dataset/images/
data/images/raw/
outputs/
runs/
*.pt
target_detection/
```

이미지 파일, 학습 결과, 모델 파일은 용량이 커질 수 있으므로 Google Drive에 보관합니다.

## 실행 명령어

기본 YOLO 테스트:

```powershell
python src/detector.py --model yolo11n.pt --image data/images/raw/test.png
```

전처리 resize 테스트:

```powershell
python src/preprocess.py --image data/images/raw/test.png --output outputs/processed/test_resized.jpg
```

커스텀 모델 학습:

```powershell
yolo detect train data=dataset/data.yaml model=yolo11n.pt epochs=30 imgsz=640
```

학습 모델 테스트:

```powershell
python src/detector.py --model runs/detect/train/weights/best.pt --image data/images/raw/test.png
```

## 백엔드와 맞출 API 기준

```text
POST /api/detect
Content-Type: multipart/form-data
field name: file
```

응답:

```json
{
  "detections": [
    {
      "item_name": "can",
      "count": 1,
      "confidence": 0.92,
      "image_filename": "test.png",
      "analyzed_at": "2026-05-16 12:00:00",
      "result_image_path": "outputs/detected/test_result.jpg"
    }
  ]
}
```

## 4주차로 넘길 항목

- FastAPI `/api/detect` 실제 구현
- UI에서 업로드한 이미지와 AI 서버 연결
- 백엔드 DTO와 AI JSON 최종 매핑
- `operation_type` 협의
- 추가 이미지 수집 및 라벨 품질 개선
- `best.pt` 모델 성능 확인 및 재학습

## operation_type 협의 메모

입고/반출/재고 확인은 AI가 계산하지 않고 백엔드가 처리하는 것이 좋습니다.

AI는 이미지에서 물품명, 수량, 신뢰도만 반환합니다.

```text
AI: item_name, count, confidence 탐지
Backend: INBOUND, OUTBOUND, STOCK_CHECK 계산 및 DB 저장
UI: 사용자가 작업 유형 선택
```
