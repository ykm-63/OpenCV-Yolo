package luma.example.luma_scan.service;

import luma.example.luma_scan.dto.DetectionItem;
import luma.example.luma_scan.entity.DetectionResult;
import luma.example.luma_scan.entity.Product;
import luma.example.luma_scan.entity.StockTransaction;
import luma.example.luma_scan.repository.DetectionResultRepository;
import luma.example.luma_scan.repository.ProductRepository;
import luma.example.luma_scan.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VisionService {

    private final ProductRepository productRepository;
    private final DetectionResultRepository detectionResultRepository;
    private final StockTransactionRepository stockTransactionRepository;

    @Transactional
    public void processDetection(String productId, int count, double confidence) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        int beforeQty = getCurrentQty(product);
        saveDetection(product, count, count, confidence, null, "SET", beforeQty);
    }

    @Transactional
    public void processDetection(DetectionItem item) {
        processDetection(item, "SET");
    }

    @Transactional
    public void processDetection(DetectionItem item, String action) {
        Product product = productRepository.findByName(item.getItemName())
                .orElseThrow(() -> new RuntimeException("Product not found by name: " + item.getItemName()));

        int detectedCount = item.getCount() == null ? 0 : item.getCount();
        int beforeQty = getCurrentQty(product);
        String normalizedAction = normalizeAction(action);
        int nextQty = switch (normalizedAction) {
            case "ADD" -> beforeQty + detectedCount;
            case "REMOVE" -> Math.max(beforeQty - detectedCount, 0);
            default -> detectedCount;
        };

        saveDetection(
                product,
                nextQty,
                detectedCount,
                item.getConfidence() == null ? 0.0 : item.getConfidence(),
                item.getResultImagePath(),
                normalizedAction,
                beforeQty
        );
    }

    private void saveDetection(
            Product product,
            int nextQty,
            int detectedQty,
            double confidence,
            String snapshotUrl,
            String action,
            int beforeQty
    ) {
        product.setCurrentQty(nextQty);
        product.setStatus(product.getCurrentQty() < product.getMinQty() ? "부족" : "정상");

        DetectionResult result = new DetectionResult();
        result.setProduct(product);
        result.setDetectedQty(detectedQty);
        result.setConfidence(confidence);
        result.setSnapshotUrl(snapshotUrl);
        DetectionResult savedResult = detectionResultRepository.save(result);

        StockTransaction transaction = new StockTransaction();
        transaction.setProductId(product.getProductId());
        transaction.setProductName(product.getName());
        transaction.setAction(action);
        transaction.setQuantity(detectedQty);
        transaction.setBeforeQty(beforeQty);
        transaction.setAfterQty(nextQty);
        transaction.setDetectionResultId(savedResult.getResultId());
        stockTransactionRepository.save(transaction);
    }

    private int getCurrentQty(Product product) {
        return product.getCurrentQty() == null ? 0 : product.getCurrentQty();
    }

    private String normalizeAction(String action) {
        if (action == null) {
            return "SET";
        }

        return switch (action.toUpperCase()) {
            case "ADD", "REMOVE", "SET" -> action.toUpperCase();
            default -> "SET";
        };
    }
}
