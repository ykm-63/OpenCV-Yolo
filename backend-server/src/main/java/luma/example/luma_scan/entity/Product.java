package luma.example.luma_scan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Product {
    @Id
    @Column(name = "product_id", length = 20)
    private String productId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "current_qty")
    private Integer currentQty = 0;

    @Column(name = "min_qty")
    private Integer minQty = 0;

    @Column(length = 20)
    private String status = "정상";
}
