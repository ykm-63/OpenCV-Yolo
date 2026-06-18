# AI API Contract

AI 서버와 백엔드가 맞춰야 하는 YOLO 탐지 요청/응답 형식입니다.
3주차 기준 목표는 YOLO 샘플 실행, 결과 이미지 저장, `item_name`/`confidence` 추출, 백엔드 전달용 JSON 형식 확정입니다.

## API

```text
POST http://127.0.0.1:8000/api/detect
```

## Request

```text
Content-Type: multipart/form-data
file: 업로드 이미지 파일
```

백엔드는 이미지 파일 1개를 `file` 필드명으로 전송합니다.
Spring Boot에서는 `MultipartFile file` 기준으로 맞춥니다.

## Success Response

```json
{
  "detections": [
    {
      "item_name": "cola",
      "count": 1,
      "confidence": 0.92,
      "image_filename": "test.png",
      "analyzed_at": "2026-05-15 12:00:00",
      "result_image_path": "outputs/detected/test_result.jpg"
    }
  ]
}
```

## Response Fields

| field | meaning |
| --- | --- |
| `item_name` | 탐지된 물품명 또는 YOLO class label |
| `count` | 같은 물품으로 묶인 탐지 개수 |
| `confidence` | 탐지 신뢰도, 0~1 사이 숫자 |
| `image_filename` | 분석한 원본 이미지 파일명 |
| `analyzed_at` | 분석 시간, `YYYY-MM-DD HH:mm:ss` 문자열 |
| `result_image_path` | 박스가 그려진 결과 이미지 경로 |

## Error Response

```json
{
  "error": "Image could not be analyzed"
}
```

## Backend DTO 기준

백엔드는 아래 camelCase 필드명으로 DTO를 만들면 됩니다.

```text
itemName
count
confidence
imageFilename
analyzedAt
resultImagePath
```

## DB Column 기준

MariaDB 테이블은 아래 snake_case 컬럼 기준으로 맞춥니다.

```text
item_name
count
confidence
image_filename
analyzed_at
result_image_path
```

## Image Input Rules

- YOLO 입력 이미지는 컬러를 유지합니다.
- resize는 가능합니다.
- 흑백 변환은 테스트용으로만 사용하고 YOLO 기본 입력에는 사용하지 않습니다.
- 원본 이미지는 `data/images/raw`에 둡니다.
- 탐지 결과 이미지는 `outputs/detected`에 저장합니다.

## Team Lead Check Items

- 백엔드가 `POST /api/detect` 기준으로 맞출 수 있는지 확인합니다.
- 백엔드가 `MultipartFile` 업로드 방식을 준비할 수 있는지 확인합니다.
- 백엔드가 JSON 필드명을 맞출 수 있는지 확인합니다.
- UI에 이미지 업로드, 결과 표시, 재고 목록 화면이 있는지 확인합니다.
- AI 전처리가 원본 컬러 유지와 resize 기준으로 정리되는지 확인합니다.

## Local YOLO Test

설치:

```powershell
pip install -r requirements.txt
```

샘플 이미지 위치:

```text
data/images/raw/test.png
```

실행:

```powershell
python src/detector.py
```

결과:

```text
outputs/detected/test_result.jpg
outputs/detected/test_detections.json
```
