# Data Folder

이 폴더는 이미지와 영상 데이터를 두는 곳입니다.
대용량 파일은 GitHub에 올리지 않고 Google Drive로 공유합니다.

## Google Drive

여기에 구글드라이브 링크 입력

## 폴더 구조

```text
data/
  images/
    raw/
    test/
  videos/
    raw/
```

## 폴더 의미

| 경로 | 의미 |
| --- | --- |
| `data/images/raw/` | 원본 이미지 저장 |
| `data/images/test/` | OpenCV/YOLO 테스트용 이미지 저장 |
| `data/videos/raw/` | 원본 영상 저장 |

## 규칙

- 원본 파일명은 가능하면 바꾸지 않습니다.
- GitHub에는 이미지와 영상을 commit하지 않습니다.
- 팀원은 Google Drive에서 데이터를 받은 뒤 같은 폴더 구조로 배치합니다.
- 결과 이미지는 `outputs/` 아래에 저장합니다.
