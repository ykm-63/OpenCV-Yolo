# Outputs Folder

이 폴더는 프로그램 실행 결과를 저장하는 곳입니다.
실제 결과 파일은 계속 바뀌기 때문에 GitHub에는 올리지 않습니다.

## 폴더 구조

```text
outputs/
  original/
  processed/
  detected/
  results.json
  results.example.json
```

## 폴더 의미

| 경로 | 의미 |
| --- | --- |
| `outputs/original/` | 처리 시 복사해 둔 원본 이미지 |
| `outputs/processed/` | 흑백, 리사이즈, 블러 등 전처리 결과 |
| `outputs/detected/` | YOLO 탐지 박스가 그려진 결과 이미지 |
| `outputs/results.json` | 나중에 DB에 넣기 전 임시 결과 데이터 |
| `outputs/results.example.json` | 결과 데이터 예시 |

## 결과 데이터 기준

YOLO 탐지 결과는 아래 항목을 기준으로 저장합니다.

- 품목명
- 수량
- 신뢰도
- 이미지 파일명
- 분석 시간
- 결과 이미지 경로
