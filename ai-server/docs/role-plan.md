# Role Plan

회의 때 참고하기 위한 임시 역할 분담 문서입니다.
프로젝트 진행 중 역할이 바뀌면 수정하거나 삭제해도 됩니다.

## 전체 개발 흐름

```text
데이터 준비
-> OpenCV 전처리
-> YOLO 객체 탐지
-> 결과 이미지 저장
-> 결과 데이터 저장
-> DB 저장
-> 웹 조회
```

## 기본 역할 분담

| 담당 | 주요 파일 | 역할 |
| --- | --- | --- |
| Yu | `src/main.py`, `src/result_writer.py` | 전체 실행 흐름 통합, 결과 JSON 저장 |
| A | `src/dataset.py`, `data/README.md` | 데이터셋 정리, 파일명 규칙, Google Drive 데이터 안내 |
| B | `src/preprocess.py` | OpenCV 이미지 전처리 |
| C | `src/detector.py` | YOLO 객체 탐지 |

## DB/웹 단계 역할 확장

| 담당 | 추가 파일 | 추가 역할 |
| --- | --- | --- |
| Yu | `src/api.py` | API 연결, 전체 통합 테스트 |
| A | `src/database.py` | DB 테이블 구조, 탐지 결과 DB 저장 |
| B | `src/upload_handler.py` | 업로드 이미지 저장, 업로드 후 전처리 연결 |
| C | `web/templates/`, `web/static/` | 결과 조회 웹 화면, 탐지 결과 표시 |

## 주차별 역할

| 시기 | Yu | A | B | C |
| --- | --- | --- | --- | --- |
| 1~2주차 | `main.py` 실행 흐름 정리 | 데이터 폴더/파일명 규칙 정리 | 흑백, resize, blur 전처리 테스트 | YOLO 설치/사용 방식 조사 |
| 3~4주차 | 각 기능 연결 준비 | YOLO 테스트 이미지 정리 | 전처리 함수 정리 | YOLO 샘플 이미지 탐지 |
| 5주차 | `result_writer.py`로 결과 JSON 저장 | 결과 데이터 항목 검토 | 전처리 결과 확인 | 탐지 결과 이미지 저장 |
| 6주차 | API 연결 | DB 테이블 생성/저장 | 업로드 이미지 전처리 연결 | 웹 결과 화면 구성 |
| 7~8주차 | 전체 통합 테스트 | DB 저장/조회 검증 | 업로드 -> 전처리 검증 | YOLO -> 웹 표시 검증 |

## 추천 최종 파일 구조

```text
src/
  main.py
  config.py
  dataset.py
  preprocess.py
  detector.py
  result_writer.py
  database.py
  upload_handler.py
  api.py

web/
  templates/
    index.html
    results.html
  static/
    style.css
```

## 역할별 짧은 코드 예시

### Yu: main.py

```python
from pathlib import Path

from preprocess import convert_to_gray
from result_writer import save_result


def main():
    image_path = Path("data/images/test/test_001.jpg")
    output_path = Path("outputs/processed/test_001_gray.jpg")

    convert_to_gray(image_path, output_path)

    save_result(
        item_name="test",
        count=1,
        confidence=1.0,
        image_filename=image_path.name,
        result_image_path=str(output_path),
    )


if __name__ == "__main__":
    main()
```

### A: dataset.py

```python
from pathlib import Path


def list_test_images(folder: Path):
    jpg_files = sorted(folder.glob("*.jpg"))
    png_files = sorted(folder.glob("*.png"))
    return jpg_files + png_files
```

### B: preprocess.py

```python
from pathlib import Path

import cv2


def convert_to_gray(input_path: Path, output_path: Path):
    image = cv2.imread(str(input_path))

    if image is None:
        raise FileNotFoundError(input_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), gray)

    return output_path
```

### C: detector.py

```python
from pathlib import Path


def detect_objects(image_path: Path):
    return [
        {
            "item_name": "sample_item",
            "count": 1,
            "confidence": 0.95,
            "image_filename": image_path.name,
            "result_image_path": "outputs/detected/result_001.jpg",
        }
    ]
```

### A: database.py

```python
import sqlite3


def get_connection():
    return sqlite3.connect("outputs/results.db")


def create_tables():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT,
            count INTEGER,
            confidence REAL,
            image_filename TEXT,
            analyzed_at TEXT,
            result_image_path TEXT
        )
    """)
    conn.commit()
    conn.close()
```

## 브랜치 규칙

처음에는 이름 기준 브랜치로 시작합니다.

```text
feature/yu
feature/a
feature/b
feature/c
```

작업이 커지면 기능명을 붙여 나눌 수 있습니다.

```text
feature/yu-api
feature/a-database
feature/b-upload-preprocess
feature/c-yolo-web
```

`main` 브랜치에는 직접 push하지 않고, 각자 브랜치에서 작업한 뒤 Pull Request로 합칩니다.
