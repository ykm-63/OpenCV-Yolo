package luma.example.luma_scan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DetectionItem {
    @JsonProperty("item_name")
    private String itemName;

    private Integer count;

    private Double confidence;

    @JsonProperty("image_filename")
    private String imageFilename;

    @JsonProperty("analyzed_at")
    private String analyzedAt;

    @JsonProperty("result_image_path")
    private String resultImagePath;

    @JsonProperty("result_image_url")
    private String resultImageUrl;

    @JsonProperty("result_image_base64")
    private String resultImageBase64;
}
