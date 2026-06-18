# Leader Checklist

팀장이 매주 확인할 검수 항목입니다.
AI 파트와 백엔드 파트가 같은 데이터 구조를 보고 있는지 확인하는 것이 핵심입니다.

## 핵심 검수 기준

아래 4개가 서로 같은 구조를 보고 있어야 합니다.

```text
AI 응답 JSON
= Spring Boot DTO
= MariaDB 테이블 컬럼
= 화면 표시 항목
```

## 매주 공통 체크

- 각자 작업 브랜치가 최신 `main`과 너무 멀어지지 않았는가?
- 이미지/영상/결과물이 GitHub에 올라가고 있지 않은가?
- Google Drive 데이터 폴더 규칙이 지켜지고 있는가?
- 이번 주에 실제 실행 가능한 결과물이 있는가?
- 회의에서 결정된 내용이 Notion 또는 `docs/`에 정리됐는가?
- AI 파트와 백엔드 파트가 API 형식 변경을 서로 공유했는가?

## 1~2주차 체크: 기초 세팅

### AI 파트

- `data/images/raw/`, `data/images/test/`, `data/videos/raw/` 구조가 정해졌는가?
- 테스트 이미지 파일명 규칙이 정해졌는가?
- OpenCV로 이미지 읽기/저장이 되는가?
- 흑백, resize, blur 테스트 결과가 있는가?
- 전처리 결과가 `outputs/processed/`에 저장되는가?

### 백엔드 파트

- Spring Boot 프로젝트가 생성됐는가?
- Java 17, Spring Web, JPA, MariaDB 의존성이 준비됐는가?
- MariaDB 설치/접속 계획이 정해졌는가?
- Thymeleaf 기본 화면이 준비됐는가?
- 업로드 화면 초안이 있는가?

### 팀장 확인 질문

- 모든 팀원이 자기 개발 환경을 실행할 수 있는가?
- GitHub 브랜치 규칙을 이해했는가?
- 데이터는 GitHub가 아니라 Google Drive로 공유하기로 했는가?

## 3~4주차 체크: AI 탐지 준비 + 백엔드 연결 준비

### AI 파트

- `src/preprocess.py`에 전처리 함수가 정리됐는가?
- YOLOv8 샘플 모델이 실행되는가?
- 샘플 이미지 탐지 결과가 나오는가?
- confidence 값이 추출되는가?
- 탐지 결과 이미지가 `outputs/detected/`에 저장되는가?
- FastAPI `/api/detect` 초안이 있는가?

### 백엔드 파트

- Spring Boot에서 Python API를 호출할 방식이 정해졌는가?
- 요청 형식이 `multipart/form-data`로 정해졌는가?
- 이미지 파일 필드명이 `file`로 정해졌는가?
- Python 응답 JSON을 받을 DTO 초안이 있는가?
- DB 테이블 초안이 있는가?

### 팀장 확인 질문

- Python API 주소가 `POST /api/detect`로 통일됐는가?
- AI 응답 JSON과 백엔드 DTO 필드명이 같은가?
- 업로드 화면에서 보낸 파일이 Python에서 받을 수 있는 형식인가?

## 5주차 체크: AI 결과 형식 확정

### AI 파트

- `src/detector.py`가 정리됐는가?
- `src/result_writer.py`가 결과 JSON을 저장하는가?
- FastAPI 응답 형식이 고정됐는가?
- 탐지 결과에 아래 필드가 있는가?

```text
item_name
count
confidence
image_filename
analyzed_at
result_image_path
```

- 오탐/미탐 사례가 기록됐는가?

### 백엔드 파트

- MariaDB 테이블 구조가 확정됐는가?
- `items`, `stocks`, `detection_logs` 역할이 나뉘었는가?
- JPA Entity와 AI JSON 필드가 매칭되는가?
- 결과 화면에 보여줄 항목이 확정됐는가?

### 팀장 확인 질문

- AI JSON 필드와 DB 컬럼이 서로 맞는가?
- 화면에 보여줄 항목이 DB에서 조회 가능한가?
- confidence가 낮은 결과를 어떻게 처리할지 정했는가?

## 6주차 체크: DB/웹 연결

### AI 파트

- FastAPI 서버가 실제로 실행되는가?
- `/api/detect`가 이미지 파일을 받는가?
- 실제 이미지 분석 결과 JSON이 반환되는가?
- 실패했을 때 에러 JSON이 반환되는가?
- Spring Boot에서 보낸 이미지가 Python에서 정상 처리되는가?

### 백엔드 파트

- Spring Boot가 FastAPI 서버에 이미지를 보내는가?
- AI 응답 JSON을 파싱하는가?
- MariaDB에 탐지 결과가 저장되는가?
- DB에서 결과를 조회할 수 있는가?
- Thymeleaf 화면에서 결과 목록이 보이는가?

### 팀장 확인 질문

- 웹 업로드 -> Python 분석 -> DB 저장 흐름이 한 번이라도 성공했는가?
- 실패 시 사용자에게 알림이 보이는가?
- 결과 이미지 경로와 DB 데이터가 일치하는가?

## 7~8주차 체크: 통합/성능 테스트

### AI 파트

- 여러 이미지 크기에서 전처리가 안정적인가?
- 깨진 파일이나 지원하지 않는 확장자를 처리하는가?
- 여러 상품 탐지가 되는가?
- 결과 이미지 박스/라벨이 정상 표시되는가?
- 탐지 실패 케이스가 정리됐는가?

### 백엔드 파트

- 웹 업로드 -> AI 분석 -> DB 저장 -> 화면 출력이 이어지는가?
- 동일 상품 재고 수량 업데이트 방식이 동작하는가?
- `detection_logs`에 분석 기록이 쌓이는가?
- 반응형 화면이 확인됐는가?
- 발표용 시연 흐름이 준비됐는가?

### 팀장 확인 질문

- 발표 시연용 이미지가 준비됐는가?
- 성공 케이스와 실패 케이스를 둘 다 보여줄 수 있는가?
- 최종 README와 docs가 실제 실행 방법과 맞는가?
- 각 팀원이 맡은 부분을 설명할 수 있는가?

## API 계약 체크

AI와 백엔드가 반드시 맞춰야 하는 형식입니다.

### 요청

```text
POST /api/detect
Content-Type: multipart/form-data
file: 업로드 이미지 파일
```

### 정상 응답

```json
{
  "detections": [
    {
      "item_name": "cola",
      "count": 3,
      "confidence": 0.92,
      "image_filename": "test_001.jpg",
      "analyzed_at": "2026-05-07 12:00:00",
      "result_image_path": "outputs/detected/result_001.jpg"
    }
  ]
}
```

### 실패 응답

```json
{
  "error": "Image could not be analyzed"
}
```

## 병합 전 체크

- `git status`가 깨끗한가?
- 작업 브랜치에서 실행 테스트를 했는가?
- 이미지/영상/결과 파일이 커밋에 포함되지 않았는가?
- `requirements.txt` 또는 설정 변경이 있으면 문서도 같이 수정했는가?
- PR 설명에 테스트 방법이 적혀 있는가?
