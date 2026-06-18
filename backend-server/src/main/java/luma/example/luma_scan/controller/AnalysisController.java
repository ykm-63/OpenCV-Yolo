package luma.example.luma_scan.controller;

import luma.example.luma_scan.dto.DetectionResponse;
import luma.example.luma_scan.entity.DetectionResult;
import luma.example.luma_scan.repository.DetectionResultRepository;
import luma.example.luma_scan.service.VisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final WebClient.Builder webClientBuilder;
    private final VisionService visionService;
    private final DetectionResultRepository detectionResultRepository;
    private volatile DetectionResponse latestResponse;

    @Value("${ai.server.url:http://127.0.0.1:8000}")
    private String aiServerUrl;

    @PostMapping(value = "/detect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DetectionResponse detect(@RequestParam("file") MultipartFile file) throws IOException {
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", file.getResource())
                .filename(file.getOriginalFilename() == null ? "upload.jpg" : file.getOriginalFilename())
                .contentType(MediaType.parseMediaType(
                        file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType()
                ));

        DetectionResponse response = webClientBuilder.build()
                .post()
                .uri(aiServerUrl + "/api/detect")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .bodyToMono(DetectionResponse.class)
                .block();

        latestResponse = response;
        return response;
    }

    @GetMapping(value = "/result-image", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> resultImage(@RequestParam("path") String path) {
        byte[] image = webClientBuilder.build()
                .get()
                .uri(aiServerUrl + path)
                .retrieve()
                .bodyToMono(byte[].class)
                .block();

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    @GetMapping("/latest")
    public DetectionResponse latest() {
        return latestResponse == null ? new DetectionResponse() : latestResponse;
    }

    @GetMapping("/recent")
    public List<Map<String, Object>> recent() {
        return detectionResultRepository.findRecentWithProduct().stream()
                .limit(20)
                .map(this::toRecentDetection)
                .toList();
    }

    @PostMapping("/save-latest")
    public DetectionResponse saveLatest(@RequestParam(defaultValue = "SET") String action) {
        DetectionResponse response = latestResponse == null ? new DetectionResponse() : latestResponse;
        for (var item : response.getDetections() == null
                ? Collections.<luma.example.luma_scan.dto.DetectionItem>emptyList()
                : response.getDetections()) {
            visionService.processDetection(item, action);
        }
        return response;
    }

    private Map<String, Object> toRecentDetection(DetectionResult result) {
        return Map.of(
                "resultId", result.getResultId() == null ? 0 : result.getResultId(),
                "productId", result.getProduct() == null ? "" : result.getProduct().getProductId(),
                "productName", result.getProduct() == null ? "" : result.getProduct().getName(),
                "detectedQty", result.getDetectedQty() == null ? 0 : result.getDetectedQty(),
                "confidence", result.getConfidence() == null ? 0 : result.getConfidence(),
                "snapshotUrl", result.getSnapshotUrl() == null ? "" : result.getSnapshotUrl(),
                "detectedAt", result.getDetectedAt() == null ? "" : result.getDetectedAt()
        );
    }
}
