package luma.example.luma_scan.config;

import luma.example.luma_scan.entity.Product;
import luma.example.luma_scan.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        createProduct("E001", "empty_plate", "electrical", 0, 5);
        createProduct("E002", "double_outlet", "electrical", 0, 5);
        createProduct("E003", "switch_single_outlet", "electrical", 0, 5);
        createProduct("E004", "media_port", "electrical", 0, 5);
        createProduct("E005", "multi_switch", "electrical", 0, 5);
    }

    private void createProduct(
            String productId,
            String name,
            String category,
            int currentQty,
            int minQty
    ) {
        Product product = productRepository.findById(productId)
                .orElseGet(Product::new);
        product.setProductId(productId);
        product.setName(name);
        product.setCategory(category);
        if (product.getCurrentQty() == null) {
            product.setCurrentQty(currentQty);
        }
        product.setMinQty(minQty);
        product.setStatus(product.getCurrentQty() < product.getMinQty() ? "부족" : "정상");
        productRepository.save(product);
    }
}
