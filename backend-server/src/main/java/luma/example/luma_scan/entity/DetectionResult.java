package luma.example.luma_scan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class DetectionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Integer detectedQty;

    private Double confidence;

    private String snapshotUrl;

    @Column(name = "log_id")
    private Long logId;

    private LocalDateTime detectedAt = LocalDateTime.now();
}
