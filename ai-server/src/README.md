# Source Folder

이 폴더는 Python 코드가 들어가는 곳입니다.

## 파일 역할

| 파일 | 역할 |
| --- | --- |
| `main.py` | 프로그램 실행 시작 파일 |
| `config.py` | 프로젝트 공통 경로 설정 파일 |

## 코드 추가 규칙

기능이 커지면 `src/` 아래에 파일을 나누어 추가합니다.

```text
src/
  camera.py       # 카메라 입력
  preprocess.py   # 이미지 전처리
  detector.py     # YOLO 탐지
  database.py     # DB 저장
```

처음에는 `main.py`에서 실행 흐름을 연결하고, 공통 경로는 `config.py`에서 가져와 사용합니다.
