package luma.example.luma_scan.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DetectionResponse {
    private List<DetectionItem> detections;
}
