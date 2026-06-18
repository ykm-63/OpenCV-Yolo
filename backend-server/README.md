# Backend Server

Spring Boot 기반 재고 관리 서버입니다.

웹 화면, DB 연동, 입고/출고 처리, FastAPI AI 서버 호출을 담당합니다. 사용자가 이미지를 업로드하면 Spring Boot가 Python FastAPI 서버로 이미지를 전달하고, YOLO 분석 결과를 받아 화면 표시와 재고 DB 반영을 처리합니다.

## 실행 방법

H2 메모리 DB로 실행:

```cmd
cd C:\dev\opencv-inventory-Luma\backend-server
.\mvnw.cmd spring-boot:run
```

MariaDB 프로필로 실행:

```cmd
cd C:\dev\opencv-inventory-Luma\backend-server
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mariadb
```

접속 주소:

```text
http://localhost:8080
http://localhost:8080/analysis
http://localhost:8080/inbound
http://localhost:8080/outbound
```

`mvnw.cmd` 실행 중 `'powershell' is not recognized` 오류가 나면 CMD에서 아래를 먼저 실행합니다.

```cmd
set "PATH=%PATH%;C:\Windows\System32\WindowsPowerShell\v1.0"
```

## AI 서버 연결 설정

AI 서버 주소는 `application.properties`와 `application-mariadb.properties`에서 설정합니다.

```properties
ai.server.url=http://127.0.0.1:8000
```

AI 서버도 함께 실행되어 있어야 이미지 분석 기능이 동작합니다.

```powershell
cd C:\dev\opencv-inventory-Luma\ai-server
uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000
```

## 주요 API

| 메서드 | URL | 기능 |
| --- | --- | --- |
| `POST` | `/api/analysis/detect` | 업로드 이미지를 AI 서버로 전달하고 YOLO 탐지 결과 반환 |
| `GET` | `/api/analysis/result-image` | AI 서버의 탐지 결과 이미지를 프록시 조회 |
| `GET` | `/api/analysis/latest` | 최신 분석 결과 조회 |
| `GET` | `/api/analysis/recent` | DB에 저장된 최근 분석 결과 조회 |
| `POST` | `/api/analysis/save-latest` | 최신 분석 결과를 재고에 반영 |
| `GET` | `/api/inventory/all` | 전체 상품 재고 조회 |
| `GET` | `/api/stock-transactions` | 입고/반출 이력 조회 |
| `POST` | `/api/stock-transactions` | 입고/반출 직접 등록 |
| `GET` | `/api/stock-transactions/recent` | 최근 입고/반출 이력 조회 |

## 주요 Java 코드 역할

### Application / Config

| 파일 | 기능 | 사용 위치 |
| --- | --- | --- |
| `LumaScanApplication.java` | Spring Boot 실행 진입점 | 서버 시작 |
| `config/DataInitializer.java` | 초기 상품 5종 등록 | 앱 실행 시 자동 실행 |
| `config/WebClientConfig.java` | AI 서버 호출용 WebClient 설정 | `AnalysisController`에서 사용 |

### Controller

| 파일 | 기능 | 주요 URL |
| --- | --- | --- |
| `controller/PageController.java` | Thymeleaf 페이지 라우팅 | `/`, `/home`, `/analysis`, `/inbound`, `/outbound` |
| `controller/AnalysisController.java` | 이미지 분석 요청, 결과 이미지 조회, 분석 결과 저장 | `/api/analysis/*` |
| `controller/InventoryController.java` | 전체 재고 조회, 단순 탐지 반영 테스트 | `/api/inventory/all` |
| `controller/StockTransactionController.java` | 입고/출고 이력 조회 및 등록 | `/api/stock-transactions` |

### Service

| 파일 | 기능 | 사용 위치 |
| --- | --- | --- |
| `service/InventoryService.java` | 전체 상품 목록 조회 | `InventoryController` |
| `service/VisionService.java` | YOLO 분석 결과를 `Product`, `DetectionResult`, `StockTransaction`에 반영 | `AnalysisController` |
| `service/StockTransactionService.java` | 입고/출고 직접 등록 시 재고 증가/감소 처리 | `StockTransactionController` |

### Entity

| 파일 | 기능 | 주요 필드 |
| --- | --- | --- |
| `entity/Product.java` | 상품과 현재 재고 정보 | `productId`, `name`, `category`, `currentQty`, `minQty`, `status` |
| `entity/DetectionResult.java` | YOLO 분석 결과 저장 | `product`, `detectedQty`, `confidence`, `snapshotUrl`, `detectedAt` |
| `entity/StockTransaction.java` | 입고/반출/분석 반영 이력 저장 | `action`, `quantity`, `beforeQty`, `afterQty`, `memo` |
| `entity/Inventory.java` | 초기 재고 관리용 엔티티 | `itemName`, `quantity` |

### Repository / DTO

| 파일 | 기능 |
| --- | --- |
| `repository/ProductRepository.java` | 상품 조회, 이름 기준 상품 조회 |
| `repository/DetectionResultRepository.java` | 최근 분석 결과 조회 |
| `repository/StockTransactionRepository.java` | 최근 입고/반출 이력 조회 |
| `repository/InventoryRepository.java` | 초기 재고 엔티티 조회 |
| `dto/DetectionItem.java` | AI 서버 탐지 결과 1건 매핑 |
| `dto/DetectionResponse.java` | AI 서버 탐지 응답 전체 매핑 |
| `dto/StockTransactionRequest.java` | 입고/반출 등록 요청 매핑 |

## UI 파일 역할

### HTML

| 파일 | 기능 |
| --- | --- |
| `templates/pages/home.html` | 재고 대시보드 화면 |
| `templates/pages/analysis.html` | 이미지 업로드, YOLO 분석, 재고 반영 화면 |
| `templates/pages/inbound.html` | 입고 관리 화면 |
| `templates/pages/outbound.html` | 반출 관리 화면 |
| `templates/fragments/header.html` | 공통 헤더 |
| `templates/fragments/sidebar.html` | 공통 사이드바 |

### JavaScript

| 파일 | 기능 |
| --- | --- |
| `static/js/pages/analysis.js` | 이미지 업로드, 분석 요청, 결과 렌더링, 재고 반영 |
| `static/js/pages/dashboard.js` | 홈 대시보드 재고/분석/이력 조회 |
| `static/js/pages/inbound.js` | 입고 등록, 입고 이력 조회, DB 재고 증가 |
| `static/js/pages/outbound.js` | 반출 등록, 반출 이력 조회, DB 재고 감소 |
| `static/js/pages/inventory.js` | 재고 화면 보조 스크립트 |
| `static/js/pages/login.js` | 로그인 화면 보조 스크립트 |
| `static/js/common/nav.js` | 공통 메뉴 동작 |
| `static/js/common/modal.js` | 공통 모달 동작 |

### CSS

| 파일 | 기능 |
| --- | --- |
| `static/css/common/*.css` | 버튼, 테이블, 모달, 레이아웃, reset 공통 스타일 |
| `static/css/pages/analysis.css` | 분석 화면 스타일 |
| `static/css/pages/dashboard.css` | 홈 대시보드 스타일 |
| `static/css/pages/inbound.css` | 입고 화면 스타일 |
| `static/css/pages/outbound.css` | 반출 화면 스타일 |
| `static/css/pages/inventory.css` | 재고 화면 스타일 |
| `static/css/pages/login.css` | 로그인 화면 스타일 |

## DB 반영 흐름

### YOLO 분석 결과 반영

```text
analysis.js
→ POST /api/analysis/detect
→ AnalysisController
→ FastAPI /api/detect
→ YOLO JSON 응답
→ POST /api/analysis/save-latest?action=ADD|REMOVE|SET
→ VisionService
→ Product / DetectionResult / StockTransaction 저장
```

### 입고/반출 직접 등록

```text
inbound.js 또는 outbound.js
→ POST /api/stock-transactions
→ StockTransactionController
→ StockTransactionService
→ Product.currentQty 증가/감소
→ StockTransaction 저장
```

## 설정 파일

| 파일 | 기능 |
| --- | --- |
| `application.properties` | 기본 H2 메모리 DB 설정 |
| `application-mariadb.properties` | MariaDB 연결 설정 |
| `pom.xml` | Maven 의존성 및 Spring Boot 설정 |
| `mvnw`, `mvnw.cmd` | Maven Wrapper 실행 파일 |

