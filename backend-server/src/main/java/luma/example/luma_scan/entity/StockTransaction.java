package luma.example.luma_scan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(name = "product_id", length = 20, nullable = false)
    private String productId;

    @Column(name = "product_name", length = 100, nullable = false)
    private String productName;

    @Column(length = 20, nullable = false)
    private String action;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "before_qty", nullable = false)
    private Integer beforeQty;

    @Column(name = "after_qty", nullable = false)
    private Integer afterQty;

    @Column(name = "detection_result_id")
    private Long detectionResultId;

    @Column(length = 255)
    private String memo;

    private LocalDateTime createdAt = LocalDateTime.now();
}
