package luma.example.luma_scan.controller;

import lombok.RequiredArgsConstructor;
import luma.example.luma_scan.service.InventoryService;
import luma.example.luma_scan.service.VisionService;
import lombok.RequiredArgsConstructor;
import luma.example.luma_scan.entity.Product;
import java.util.List;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final VisionService visionService;
    private final InventoryService inventoryService;

    @GetMapping("/detect")
    public String detect(@RequestParam String productId, @RequestParam int count, @RequestParam double confidence) {
        visionService.processDetection(productId, count, confidence);
        return "업데이트 성공";
    }

    @GetMapping("/all")
    public List<Product> getAllInventory() {
        return inventoryService.findAllProducts();
    }
}
