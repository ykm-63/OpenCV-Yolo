# OpenCV-Yolo

YOLO 기반 전기 자재 인식 AI 서버와 Spring Boot 기반 재고 관리 서버를 하나의 레포지토리에서 관리하는 프로젝트입니다.

## Structure

```text
OpenCV-Yolo/
├─ ai-server/       # Python, FastAPI, YOLO detection API
├─ backend-server/  # Spring Boot, UI, DB, inventory API
└─ tools/           # local helper scripts
```

## AI Server

```powershell
cd ai-server
pip install -r requirements.txt
uvicorn src.detect_api:app --reload --host 0.0.0.0 --port 8000
```

Main API:

```text
GET  /health
POST /api/detect
```

The trained model is expected at:

```text
ai-server/runs/detect/train-6/weights/best.pt
```

Model weights, raw images, videos, training outputs, and detection outputs are excluded from GitHub.

## Backend Server

```cmd
cd backend-server
.\mvnw.cmd spring-boot:run
```

MariaDB profile:

```cmd
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mariadb
```

Main pages:

```text
http://localhost:8080/
http://localhost:8080/analysis
http://localhost:8080/inbound
http://localhost:8080/outbound
```

Main APIs:

```text
POST /api/analysis/detect
POST /api/analysis/save-latest
GET  /api/inventory/all
GET  /api/stock-transactions
POST /api/stock-transactions
```

## GitHub Data Policy

This repository keeps source code, configuration, and documentation only.

Excluded from GitHub:

- raw images and videos
- YOLO datasets under `dataset/images` and `dataset/labels`
- trained model weights such as `*.pt`
- `runs/`, `outputs/`, `target/`
- zip archives and generated reports
