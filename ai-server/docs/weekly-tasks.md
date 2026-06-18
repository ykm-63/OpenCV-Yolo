# Weekly Tasks

AI 2명, 백엔드 2명 기준의 주차별 할 일 정리입니다.
팀 회의에서 이번 주 목표와 산출물을 확인할 때 사용합니다.

## 역할 기준

| 파트 | 담당 범위 |
| --- | --- |
| AI 1 | 데이터셋, Google Drive 데이터 정리, OpenCV 전처리 |
| AI 2 | YOLO 탐지, FastAPI 분석 서버, AI 응답 JSON |
| Backend 1 | Spring Boot API, Python 서버 호출, MariaDB 저장 |
| Backend 2 | Thymeleaf 화면, 이미지 업로드, 결과 조회 UI |

## 1~2주차: 기초 세팅

목표: OpenCV 기초, 데이터 폴더, 백엔드 기본 프로젝트를 준비합니다.

### AI 1

- `data/images/raw/`, `data/images/test/`, `data/videos/raw/` 구조 정리
- Google Drive 데이터 폴더 정리
- 테스트 이미지 파일명 규칙 정하기
- OpenCV 이미지 읽기/저장 테스트
- 흑백, resize, blur 테스트

### AI 2

- YOLOv8 설치 방법 조사
- `ultralytics` 사용법 조사
- Roboflow 라벨링 흐름 조사
- `src/detector.py` 임시 함수 작성
- FastAPI 기본 실행 방법 조사

### Backend 1

- Spring Boot 프로젝트 생성
- Java 17, Spring Web, JPA, MariaDB 의존성 준비
- MariaDB 설치/접속 확인
- DB 이름 정하기

### Backend 2

- Thymeleaf 적용
- 기본 화면 구성
- 이미지 업로드 폼 초안 작성
- 결과 조회 화면 초안 작성

### 산출물

- 개발 환경 설치 완료
- 테스트 이미지 규칙 확정
- 기본 업로드 화면 초안
- OpenCV 기본 전처리 테스트 결과

## 3~4주차: AI 탐지 준비 + 백엔드 연결 준비

목표: YOLO 샘플 탐지를 실행하고, Spring Boot에서 Python API를 호출할 준비를 합니다.

### AI 1

- `src/preprocess.py` 작성
- `convert_to_gray()` 작성
- `resize_image()` 작성
- `blur_image()` 작성
- `save_processed_image()` 작성
- 전처리 결과를 `outputs/processed/`에 저장

### AI 2

- YOLOv8 샘플 모델 실행
- 샘플 이미지 탐지
- 탐지 결과 confidence 추출
- 탐지 결과 이미지를 `outputs/detected/`에 저장
- FastAPI `/api/detect` 초안 작성

### Backend 1

- Python FastAPI 호출 방식 정리
- `multipart/form-data` 이미지 전송 테스트
- 응답 JSON을 받을 DTO 초안 작성
- DB 테이블 초안 작성

### Backend 2

- 업로드 화면 개선
- 결과 목록 화면 구성
- 상품명, 수량, 신뢰도, 분석 시간 표시 위치 정리

### 산출물

- 전처리 함수 초안
- YOLO 샘플 탐지 결과
- FastAPI 호출 규칙 초안
- 백엔드 DTO 초안

## 5주차: AI 결과 형식 확정

목표: AI 결과 JSON과 DB 저장 구조를 확정합니다.

### AI 1

- 전처리 방식 최종 선택
- YOLO에 넣을 이미지 크기 기준 정리
- 전처리 실패 예외 처리
- 테스트 이미지 품질 확인

### AI 2

- `src/detector.py` 정리
- `src/result_writer.py` 작성
- 탐지 결과 JSON 저장
- FastAPI 응답 형식 고정
- 오탐/미탐 사례 기록

### Backend 1

- MariaDB 테이블 생성
- `items`, `stocks`, `detection_logs` 구조 확정
- AI 응답 JSON과 DB 컬럼 매칭
- JPA Entity 작성

### Backend 2

- 결과 화면에 보여줄 항목 확정
- 업로드 성공/실패 메시지 정리
- 재고 업데이트 알림 화면 정리

### 산출물

- 확정된 AI 응답 JSON
- 확정된 DB 테이블 구조
- 결과 화면 표시 항목
- 탐지 결과 저장 예시

## 6주차: DB/웹 연결

목표: 웹 업로드 -> Python 분석 -> DB 저장 흐름을 연결합니다.

### AI 1

- 업로드된 이미지 전처리 연결
- Spring Boot에서 받은 이미지가 Python에서 처리되는지 확인
- `outputs/processed/` 저장 확인

### AI 2

- FastAPI 서버 실행 안정화
- `/api/detect` 실제 이미지 분석
- 탐지 결과 JSON 반환
- 에러 응답 형식 추가

### Backend 1

- Spring Boot에서 FastAPI 호출
- AI 응답 JSON 파싱
- MariaDB에 탐지 결과 저장
- Service/Repository 구조 정리

### Backend 2

- 웹 업로드 기능 연결
- DB에서 결과 조회
- Thymeleaf로 탐지 결과 목록 출력
- 결과 이미지 경로 표시

### 산출물

- 웹에서 이미지 업로드 가능
- Spring Boot에서 Python API 호출 가능
- MariaDB 저장 가능
- 웹에서 결과 조회 가능

## 7~8주차: 통합/성능 테스트

목표: 전체 서비스 흐름을 완성하고 발표 준비를 합니다.

### AI 1

- 전처리 속도 확인
- 다양한 이미지 크기 테스트
- 깨진 이미지/지원하지 않는 확장자 처리
- 전처리 결과 품질 검증

### AI 2

- 여러 상품 탐지 테스트
- confidence 낮은 결과 처리 기준 정리
- 결과 이미지 박스/라벨 확인
- YOLO 탐지 실패 케이스 정리

### Backend 1

- DB 저장/조회 검증
- 동일 상품 재고 업데이트 방식 확인
- `detection_logs` 기록 확인
- DB 예외 처리

### Backend 2

- 반응형 화면 확인
- 업로드/결과/재고 조회 화면 마무리
- 사용자 알림 메시지 정리
- 발표용 화면 흐름 정리

### 산출물

- 웹 업로드 -> AI 분석 -> DB 저장 -> 화면 출력 전체 흐름
- 실패 케이스 처리
- 발표 시연용 이미지와 시나리오
- 최종 README/문서 정리

## 공통 약속

- Python은 이미지 분석만 담당합니다.
- Spring Boot는 웹, API 호출, DB 저장을 담당합니다.
- MariaDB는 상품, 재고, 탐지 기록을 저장합니다.
- Google Drive는 원본 이미지와 영상 공유를 담당합니다.
- GitHub는 코드와 문서만 관리합니다.
