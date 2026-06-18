# YOLO AI Detection Summary - 2026-05-16

## 작업 목표

오늘 목표는 YOLO 커스텀 탐지 흐름을 실제로 확인하는 것이었다.

확인한 항목:

- YOLO 학습용 데이터셋 구조 구성
- 5개 class 기준 `data.yaml` 작성
- 이미지/라벨 txt 파일 생성
- YOLO 커스텀 학습 실행
- 학습된 `best.pt` 모델 생성 확인
- 혼합 테스트 이미지로 탐지 실행
- 탐지 결과 이미지와 JSON 저장 확인

## Dataset 구성

데이터셋 위치:

```text
dataset/
```

구조:

```text
dataset/
  data.yaml
  images/
    train/
    val/
  labels/
    train/
    val/
```

사용 class:

```text
0: can
1: pet_bottle
2: paper_box
3: pouch
4: glass_bottle
```

`data.yaml` 내용:

```yaml
path: dataset
train: images/train
val: images/val

names:
  0: can
  1: pet_bottle
  2: paper_box
  3: pouch
  4: glass_bottle
```

## 이미지/라벨 구성

GPT로 생성한 5x5 합성 이미지를 25개 JPG 파일로 분리했다.

분리 기준:

```text
001~004: train
005: val
```

개수:

```text
train 이미지: 20개
train 라벨: 20개
val 이미지: 5개
val 라벨: 5개
```

파일명 매칭 확인 결과:

```text
missing labels: []
missing images: []
```

즉, 이미지 파일과 라벨 txt 파일 이름은 정상적으로 맞춰져 있다.

예시:

```text
dataset/images/train/can_001.jpg
dataset/labels/train/can_001.txt

dataset/images/val/can_005.jpg
dataset/labels/val/can_005.txt
```

## YOLO 학습 실행

처음 시도한 명령:

```cmd
python -m ultralytics yolo detect train model=yolo11n.pt data=dataset/data.yaml epochs=30 imgsz=640
```

이 명령은 실패했다.

원인:

```text
ultralytics는 python -m ultralytics 방식으로 직접 실행할 수 없는 패키지였다.
```

대신 Python 코드 방식으로 학습을 실행했다.

성공한 학습 명령:

```cmd
"C:\Users\sdsd4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -c "from ultralytics import YOLO; model = YOLO('yolo11n.pt'); model.train(data='dataset/data.yaml', epochs=30, imgsz=640)"
```

학습 결과:

```text
runs/detect/train/weights/best.pt
runs/detect/train/weights/last.pt
```

`best.pt`가 정상 생성되었다.

## 학습 결과 지표

최종 validation 결과:

```text
all           P=0.692  R=1.000  mAP50=0.995  mAP50-95=0.637
can           P=0.762  R=1.000  mAP50=0.995  mAP50-95=0.600
pet_bottle    P=0.665  R=1.000  mAP50=0.995  mAP50-95=0.497
paper_box     P=0.609  R=1.000  mAP50=0.995  mAP50-95=0.796
pouch         P=0.621  R=1.000  mAP50=0.995  mAP50-95=0.697
glass_bottle  P=0.805  R=1.000  mAP50=0.995  mAP50-95=0.597
```

주의:

검증 이미지가 class당 1장뿐이라 지표가 실제 성능을 정확히 의미하지는 않는다. 이번 결과는 학습 파이프라인이 정상 동작했다는 확인용으로 보는 것이 맞다.

## 혼합 테스트 이미지 탐지

테스트 이미지:

```text
data/images/raw/test_mixed_001.png
```

실행 명령:

```cmd
"C:\Users\sdsd4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" src\detector.py --image data\images\raw\test_mixed_001.png --model runs\detect\train\weights\best.pt
```

기본 confidence 기준 결과:

```json
{
  "detections": []
}
```

결과 파일:

```text
outputs/detected/test_mixed_001_result.jpg
outputs/detected/test_mixed_001_detections.json
```

## Low Confidence 확인

기본 탐지에서는 결과가 없어서 confidence를 `0.01`로 낮춰 확인했다.

낮은 confidence 기준 탐지 결과:

```text
glass_bottle 0.0369
glass_bottle 0.0346
pet_bottle 0.0214
glass_bottle 0.0187
pet_bottle 0.0178
glass_bottle 0.0168
glass_bottle 0.0135
paper_box 0.0105
```

결과 파일:

```text
outputs/detected/test_mixed_001_lowconf_result.jpg
```

해석:

모델이 물체를 완전히 모르는 것은 아니지만 confidence가 너무 낮아서 기본 설정에서는 탐지 결과로 나오지 않았다.

## 현재 한계

현재 데이터셋은 테스트용으로 매우 작다.

한계:

- class당 이미지가 5장뿐이다.
- train은 class당 4장, val은 class당 1장이다.
- 이미지가 AI 생성 이미지라 실제 촬영 환경과 차이가 있다.
- 라벨 txt 좌표는 GPT가 만든 초안이라 실제 이미지 기준으로 완벽하지 않을 수 있다.
- 혼합 테스트 이미지는 학습 이미지보다 더 복잡해서 confidence가 낮게 나왔다.

## 결론

오늘 작업으로 확인한 것:

- YOLO 커스텀 데이터셋 구조를 만들었다.
- 5개 class 기준 `data.yaml`을 구성했다.
- 이미지와 라벨 txt 파일을 train/val로 맞췄다.
- YOLO 학습을 성공적으로 실행했다.
- 학습된 `best.pt` 모델을 생성했다.
- `detector.py`에서 커스텀 모델로 테스트 이미지를 분석했다.
- 결과 이미지와 JSON 저장까지 확인했다.

현재 모델은 학습 파이프라인 테스트에는 성공했지만, 실제 탐지 성능은 아직 부족하다.

## 다음 개선 방향

다음 단계:

- class당 이미지 수를 최소 20장 이상으로 늘린다.
- 가능하면 실제 촬영 이미지를 추가한다.
- 라벨 박스를 LabelImg 또는 Roboflow에서 다시 확인한다.
- 혼합 테스트 이미지와 비슷한 구도의 학습 이미지를 추가한다.
- epochs를 50~100 정도로 늘려 다시 학습한다.
- 재학습 후 `best.pt`로 다시 `test_mixed_001.png`를 탐지한다.

추천 목표:

```text
class당 train 20장 이상
class당 val 5장 이상
총 이미지 최소 125장 이상
```
