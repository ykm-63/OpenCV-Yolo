# Luma Scan - YOLO 재고 인식 서비스

## 📁 프로젝트 개요

YOLO 객체 인식 모델로 전기 자재 이미지를 분석하고, Spring Boot 기반 재고 관리 화면에서 탐지 결과를 조회·반영하는 컴퓨터비전 기반 재고 관리 프로토타입입니다.

Python FastAPI 서버가 업로드된 이미지를 YOLO 모델로 분석하고, Spring Boot 서버가 분석 결과를 받아 화면 표시, DB 저장, 입고/출고 재고 반영을 처리합니다.

전기 자재처럼 외형이 유사한 품목을 수작업으로 확인하는 과정을 줄이고, 이미지 기반 자동 식별 결과를 재고 관리 흐름과 연결하는 것을 목표로 했습니다.

프로젝트 기간 : 2026.05 ~ 2026.06

## 🤝 팀 소개

Luma 팀 프로젝트

| 담당 영역 | 주요 역할 |
| --- | --- |
| AI / YOLO | 데이터셋 구성, 라벨링, YOLO 학습, 모델 테스트 |
| AI API | FastAPI 서버, 이미지 분석 API, JSON 응답 구조 |
| Backend / DB | Spring Boot API, MariaDB/H2 연동, 재고·분석 결과 저장 |
| UI | 분석 화면, 입고/출고 화면, 재고 현황 표시 |

## 🛠️ 기술 스택

Backend : Java 21, Spring Boot, Spring MVC, Spring Data JPA, WebClient, Thymeleaf

Frontend : HTML, CSS, JavaScript

Database : H2, MariaDB

AI / Computer Vision : Python, FastAPI, OpenCV, Ultralytics YOLO

Model / Dataset : YOLO `best.pt`, YOLO label txt, `data.yaml`

Tooling : Maven Wrapper, Git, GitHub

## 🗏 페이지 구성

### 홈 페이지

- 전체 재고 현황 요약
- 최근 분석 결과 조회
- 최근 입고/출고 처리 이력 조회

### AI 분석 페이지

- 이미지 업로드 또는 카메라 프레임 기반 분석
- Spring Boot가 FastAPI `/api/detect`로 이미지 전송
- YOLO 탐지 결과 JSON 수신
- 탐지 품목, 개수, 신뢰도, 결과 이미지 표시
- 선택한 방식으로 재고 반영
  - 입고: `ADD`
  - 반출: `REMOVE`
  - 현재수량: `SET`

### 입고 관리 페이지

- DB 상품 목록 조회
- 입고 등록 시 `StockTransaction` 저장
- `Product.currentQty` 증가
- 입고 이력 테이블 갱신

### 반출 관리 페이지

- DB 상품 목록 조회
- 반출 등록 시 `StockTransaction` 저장
- `Product.currentQty` 감소
- 반출 이력 테이블 갱신

## 📊 데이터셋 / 모델

YOLO 학습 클래스는 `ai-server/dataset/data.yaml` 기준 5개입니다.

| class id | class name |
| --- | --- |
| 0 | `empty_plate` |
| 1 | `double_outlet` |
| 2 | `switch_single_outlet` |
| 3 | `media_port` |
| 4 | `multi_switch` |

라벨 데이터 기준:

| class name | label image count |
| --- | ---: |
| `empty_plate` | 193 |
| `double_outlet` | 168 |
| `switch_single_outlet` | 195 |
| `media_port` | 203 |
| `multi_switch` | 198 |

총 라벨 파일 수: 934개

학습 모델 기본 경로:

```text
ai-server/runs/detect/train-6/weights/best.pt
```

모델 파일과 학습 산출물은 용량 문제로 GitHub에 포함하지 않습니다.

## 🧱 ERD 개요

| 테이블 / 엔티티 | 설명 |
| --- | --- |
| `Product` | 상품 ID, 이름, 카테고리, 현재 재고, 최소 재고, 상태 |
| `DetectionResult` | YOLO 분석 결과, 탐지 수량, 신뢰도, 결과 이미지 경로, 분석 시간 |
| `StockTransaction` | 입고/반출/현재수량 반영 이력, 변경 전후 수량, 메모 |
| `Inventory` | 초기 재고 관리용 엔티티 |

재고 반영 방식:

| action | 의미 |
| --- | --- |
| `ADD` | 입고 처리, 현재 재고 증가 |
| `REMOVE` | 반출 처리, 현재 재고 감소 |
| `SET` | 분석 결과를 현재 수량으로 반영 |

## 📌 API 명세표

### 페이지 라우터

| 기능 구분 | HTTP 메서드 | URL | 설명 |
| --- | --- | --- | --- |
| 홈 페이지 | GET | `/`, `/home` | 대시보드 화면 |
| 분석 페이지 | GET | `/analysis`, `/opencv` | YOLO 이미지 분석 화면 |
| 입고 페이지 | GET | `/inbound` | 입고 관리 화면 |
| 반출 페이지 | GET | `/outbound` | 반출 관리 화면 |

### Spring Boot API

| 기능 구분 | HTTP 메서드 | URL | 설명 |
| --- | --- | --- | --- |
| 이미지 분석 요청 | POST | `/api/analysis/detect` | 업로드 이미지를 FastAPI로 전달하고 탐지 결과 반환 |
| 결과 이미지 조회 | GET | `/api/analysis/result-image` | FastAPI 서버의 결과 이미지를 프록시 조회 |
| 최신 분석 결과 조회 | GET | `/api/analysis/latest` | 메모리에 저장된 최신 탐지 결과 반환 |
| 최근 분석 DB 조회 | GET | `/api/analysis/recent` | DB에 저장된 최근 분석 결과 조회 |
| 최신 분석 재고 반영 | POST | `/api/analysis/save-latest` | 최신 탐지 결과를 `ADD`, `REMOVE`, `SET` 방식으로 DB 반영 |
| 전체 재고 조회 | GET | `/api/inventory/all` | 전체 상품 재고 목록 조회 |
| 입고/반출 이력 조회 | GET | `/api/stock-transactions` | `action` 조건별 이력 조회 |
| 입고/반출 등록 | POST | `/api/stock-transactions` | 직접 입력한 입고/반출을 DB에 저장 |
| 최근 처리 이력 조회 | GET | `/api/stock-transactions/recent` | 최근 처리 이력 20건 조회 |

### FastAPI AI Server API

| 기능 구분 | HTTP 메서드 | URL | 설명 |
| --- | --- | --- | --- |
| 헬스 체크 | GET | `/health` | 모델 경로와 confidence 설정 확인 |
| YOLO 탐지 | POST | `/api/detect` | 이미지 파일을 받아 YOLO 분석 후 JSON 반환 |

FastAPI 응답 예시:

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

## 💬 YOLO 분석 파이프라인

이미지 한 건이 처리되는 순서:

1. 사용자가 분석 화면에서 이미지 업로드
2. Spring Boot `/api/analysis/detect`가 multipart 파일 수신
3. WebClient로 FastAPI `/api/detect` 호출
4. FastAPI가 이미지를 `data/images/raw`에 저장
5. YOLO `best.pt` 모델로 객체 탐지
6. 결과 이미지를 `outputs/detected`에 저장
7. 품목명, 개수, 평균 신뢰도, 결과 이미지 경로를 JSON으로 반환
8. Spring Boot 화면에 결과 표시
9. 사용자가 재고 반영 버튼 클릭
10. `Product`, `DetectionResult`, `StockTransaction` DB 반영

## 🧩 디렉토리 구조

```text
OpenCV-Yolo/
├─ ai-server/
│  ├─ src/
│  │  ├─ config.py
│  │  ├─ detect_api.py
│  │  ├─ detector.py
│  │  ├─ frame_extractor.py
│  │  ├─ main.py
│  │  ├─ preprocess.py
│  │  └─ yolo_label_writer.py
│  ├─ dataset/
│  │  └─ data.yaml
│  ├─ data/
│  ├─ outputs/
│  └─ requirements.txt
│
├─ backend-server/
│  ├─ src/main/java/luma/example/luma_scan/
│  │  ├─ controller/
│  │  ├─ service/
│  │  ├─ repository/
│  │  ├─ entity/
│  │  ├─ dto/
│  │  └─ config/
│  ├─ src/main/resources/
│  │  ├─ templates/
│  │  ├─ static/
│  │  ├─ application.properties
│  │  └─ application-mariadb.properties
│  ├─ pom.xml
│  └─ mvnw.cmd
│
├─ tools/
└─ README.md
```

## ▶️ 실행 방법

### 1. AI 서버 실행

```powershell
cd ai-server
pip install -r requirements.txt
uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000
```

### 2. Spring Boot 서버 실행

H2 메모리 DB:

```cmd
cd backend-server
.\mvnw.cmd spring-boot:run
```

MariaDB:

```cmd
cd backend-server
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mariadb
```

접속:

```text
http://localhost:8080
http://localhost:8080/analysis
http://localhost:8080/inbound
http://localhost:8080/outbound
```

## 🚫 GitHub 업로드 제외 항목

이 레포지토리는 코드, 설정, 문서만 관리합니다.

제외 항목:

- 원본 이미지 / 영상
- YOLO 학습 이미지와 라벨 전체
- `*.pt` 모델 파일
- `ai-server/runs`
- `ai-server/outputs`
- `backend-server/target`
- zip, docx, pdf 등 발표 산출물
