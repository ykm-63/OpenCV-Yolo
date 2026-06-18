package luma.example.luma_scan.service;

import luma.example.luma_scan.entity.Product;
import luma.example.luma_scan.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;

    // 모든 상품 정보를 가져오는 메서드
    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }
}