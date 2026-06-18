package luma.example.luma_scan.service;

import luma.example.luma_scan.dto.StockTransactionRequest;
import luma.example.luma_scan.entity.Product;
import luma.example.luma_scan.entity.StockTransaction;
import luma.example.luma_scan.repository.ProductRepository;
import luma.example.luma_scan.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StockTransactionService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;

    @Transactional
    public StockTransaction create(StockTransactionRequest request) {
        if (request.productId() == null || request.productId().isBlank()) {
            throw new IllegalArgumentException("productId is required");
        }

        int quantity = request.quantity() == null ? 0 : request.quantity();
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be greater than 0");
        }

        String action = normalizeAction(request.action());
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + request.productId()));

        int beforeQty = product.getCurrentQty() == null ? 0 : product.getCurrentQty();
        int afterQty = switch (action) {
            case "ADD" -> beforeQty + quantity;
            case "REMOVE" -> Math.max(beforeQty - quantity, 0);
            default -> quantity;
        };

        product.setCurrentQty(afterQty);
        product.setStatus(afterQty < (product.getMinQty() == null ? 0 : product.getMinQty()) ? "LOW" : "NORMAL");

        StockTransaction transaction = new StockTransaction();
        transaction.setProductId(product.getProductId());
        transaction.setProductName(product.getName());
        transaction.setAction(action);
        transaction.setQuantity(quantity);
        transaction.setBeforeQty(beforeQty);
        transaction.setAfterQty(afterQty);
        transaction.setMemo(request.memo());
        transaction.setCreatedAt(request.createdAt() == null ? LocalDateTime.now() : request.createdAt());

        return stockTransactionRepository.save(transaction);
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
