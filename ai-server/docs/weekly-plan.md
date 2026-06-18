# Weekly Project Plan

Notion에 정리한 서비스 구조와 GitHub 역할 분담을 합친 주차별 개발 계획입니다.
회의 때 진행 상황을 확인하거나, 역할을 다시 조정할 때 참고합니다.

## 서비스 전체 흐름

```text
사용자 웹 업로드
-> Spring Boot가 이미지 수신
-> Python FastAPI 서버에 분석 요청
-> Python이 OpenCV 전처리 + YOLO 탐지
-> 탐지 결과 JSON 반환
-> Spring Boot가 MariaDB에 저장
-> Thymeleaf 화면에서 재고 결과 조회
```

## 역할 기준

| 담당 | 담당 파일/영역 | 역할 |
| --- | --- | --- |
| Yu | `src/main.py`, `src/result_writer.py`, API 연결 | 전체 실행 흐름 통합, 결과 저장, API 연결 |
| A | `src/dataset.py`, `data/README.md`, DB | 데이터셋 정리, 데이터 문서, DB 테이블/저장 |
| B | `src/preprocess.py`, 업로드 처리 | OpenCV 전처리, 업로드 이미지 전처리 연결 |
| C | `src/detector.py`, 웹 결과 화면 | YOLO 탐지, 탐지 결과 이미지 저장, 웹 결과 표시 |

## 1~2주차: OpenCV 기초 + 데이터셋 방향

### Yu

- `main.py` 실행 흐름 정리
- `src/config.py` 경로 구조 확인
- `python src/main.py` 실행 방법 확인
- `outputs/processed/` 저장 흐름 테스트

### A

- Google Drive 데이터 폴더 구조 정리
- `data/images/raw/`, `data/images/test/`, `data/videos/raw/` 규칙 정리
- 테스트 이미지 파일명 규칙 정하기
- 예: `test_001.jpg`, `test_002.jpg`
- `data/README.md`에 데이터 배치 방법 정리

### B

- OpenCV 기본 전처리 테스트
- 이미지 읽기
- 흑백 변환
- resize
- blur
- 전처리 결과를 `outputs/processed/`에 저장
- `src/preprocess.py` 초안 작성

### C

- YOLOv8 설치 방법 조사
- `ultralytics` 사용법 조사
- 샘플 이미지 1장으로 탐지 테스트 방법 정리
- Roboflow 라벨링 흐름 조사
- `src/detector.py`에 임시 `detect_objects()` 함수 준비

## 3~4주차: YOLO 적용 준비

### Yu

- `dataset.py`, `preprocess.py`, `detector.py`를 `main.py`에서 연결할 준비
- 실행 옵션 정리
- 예: `--image`, `--mode preprocess/detect`
- 결과 저장 경로 통일

### A

- YOLO 테스트 이미지 정리
- Google Drive에서 테스트 이미지 선정
- 라벨링 대상 이미지 구분
- 파일명 중복 방지
- 이미지 목록 관리

### B

- `preprocess.py` 함수 정리
- `convert_to_gray()`
- `resize_image()`
- `blur_image()`
- `save_processed_image()`
- 전처리 전/후 결과 비교

### C

- YOLOv8 샘플 모델 실행
- `yolov8n.pt` 또는 학습 전 기본 모델 테스트
- 탐지 결과 이미지를 `outputs/detected/`에 저장
- 탐지 결과에서 `item_name`, `confidence` 추출

## 5주차: AI 객체 인식 점검

### Yu

- `result_writer.py` 작성
- 탐지 결과를 `outputs/results.json`으로 저장
- `main.py`에서 전처리 -> 탐지 -> 결과 저장 흐름 연결
- 팀원 코드 합치기 전 충돌 확인

### A

- DB에 넣을 결과 데이터 항목 검토
- 품목명
- 수량
- 신뢰도
- 이미지 파일명
- 분석 시간
- 결과 이미지 경로
- MariaDB 테이블 초안 작성

### B

- 전처리 결과 품질 확인
- 흑백/resize/blur 중 YOLO에 도움 되는 방식 선택
- 너무 과한 전처리로 탐지율이 떨어지는지 확인

### C

- YOLO 탐지 결과 이미지 저장
- 박스/상품명/confidence 표시
- 탐지 결과 JSON에 넘길 데이터 정리
- 오탐/미탐 사례 기록

## 6주차: DB/웹 연결

### Yu

- Python FastAPI 서버 초안 작성
- Spring Boot에서 호출할 API 형식 정리
- `/api/detect` 같은 분석 엔드포인트 준비
- Python은 분석 결과 JSON만 반환하도록 구성

### A

- MariaDB 설치/접속 확인
- HeidiSQL로 DB 확인
- `items`, `stocks`, `detection_logs` 테이블 설계
- Spring Boot JPA Entity와 맞는 구조 정리
- DB 저장 테스트

### B

- 웹에서 업로드된 이미지 저장 위치 정리
- 업로드 이미지 전처리 연결
- Spring Boot가 보낸 이미지가 Python에서 읽히는지 확인
- 전처리 결과 저장 경로 확인

### C

- Thymeleaf 결과 화면 구성
- 탐지 결과 목록 표시
- 상품명, 수량, 신뢰도, 시간 출력
- 결과 이미지 경로가 화면에 보이는지 확인

## 7~8주차: 통합/성능 테스트

### Yu

- 전체 흐름 통합 테스트
- 웹 업로드 -> Python 분석 -> JSON 반환 -> DB 저장 -> 화면 출력
- 에러 발생 시 로그 확인
- 팀원 코드 merge 관리

### A

- DB 저장/조회 검증
- 동일 상품 재고 수량 업데이트 방식 확인
- `detection_logs`에 분석 기록이 쌓이는지 확인
- 테스트 데이터 정리

### B

- 업로드 -> 전처리 검증
- 이미지 크기, 확장자, 깨진 파일 처리
- 전처리 속도 확인
- `outputs/processed/` 저장 확인

### C

- YOLO -> 웹 표시 검증
- 탐지 결과 이미지가 `outputs/detected/`에 저장되는지 확인
- 웹 화면에서 결과 이미지와 수량이 맞는지 확인
- confidence 낮은 결과 처리 기준 정리

## 기술 선택 정리

| 파트 | 기술 |
| --- | --- |
| AI 파트 | Python 3.10, OpenCV, YOLOv8, FastAPI, NumPy, 필요 시 Pandas |
| 백엔드 파트 | Java 17, Spring Boot, Spring Web, Spring Data JPA, Thymeleaf, Lombok, Validation |
| DB 파트 | MariaDB, HeidiSQL, JPA Entity 기반 테이블 설계 |

## DB 저장 기준

```text
items
  상품 기본 정보

stocks
  현재 재고 수량

detection_logs
  AI 탐지 기록
```

## Python이 Spring Boot에 반환할 JSON 예시

```json
{
  "detections": [
    {
      "item_name": "cola",
      "count": 3,
      "confidence": 0.92,
      "image_filename": "test_001.jpg",
      "result_image_path": "outputs/detected/result_001.jpg"
    }
  ]
}
```

## 중요한 결정

- Python은 이미지 분석만 담당합니다.
- Spring Boot는 웹, API 호출, DB 저장을 담당합니다.
- MariaDB는 상품, 재고, 탐지 기록을 저장합니다.
- Google Drive는 원본 이미지와 영상 공유를 담당합니다.
- GitHub는 코드와 문서만 관리합니다.

## 회의 진행 순서

1. 서비스 전체 흐름 설명
2. 기술 스택 설명
3. 4명 역할 분담 설명
4. 주차별 해야 할 일 설명
5. DB에 저장할 데이터 항목 확인
6. GitHub/Google Drive/Notion 사용 방식 확인
