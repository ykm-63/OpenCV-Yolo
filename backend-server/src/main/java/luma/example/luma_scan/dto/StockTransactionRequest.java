package luma.example.luma_scan.dto;

import java.time.LocalDateTime;

public record StockTransactionRequest(
        String productId,
        String action,
        Integer quantity,
        String memo,
        LocalDateTime createdAt
) {
}
