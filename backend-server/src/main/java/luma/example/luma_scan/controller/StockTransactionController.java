package luma.example.luma_scan.controller;

import luma.example.luma_scan.dto.StockTransactionRequest;
import luma.example.luma_scan.entity.StockTransaction;
import luma.example.luma_scan.repository.StockTransactionRepository;
import luma.example.luma_scan.service.StockTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock-transactions")
@RequiredArgsConstructor
public class StockTransactionController {

    private final StockTransactionRepository stockTransactionRepository;
    private final StockTransactionService stockTransactionService;

    @GetMapping
    public List<StockTransaction> list(@RequestParam(required = false) String action) {
        if (action == null || action.isBlank()) {
            return stockTransactionRepository.findTop20ByOrderByCreatedAtDesc();
        }

        return stockTransactionRepository.findByActionOrderByCreatedAtDesc(action.toUpperCase());
    }

    @PostMapping
    public StockTransaction create(@RequestBody StockTransactionRequest request) {
        return stockTransactionService.create(request);
    }

    @GetMapping("/recent")
    public List<StockTransaction> recent() {
        return stockTransactionRepository.findTop20ByOrderByCreatedAtDesc();
    }
}
