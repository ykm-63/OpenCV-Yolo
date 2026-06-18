package luma.example.luma_scan.repository;

import luma.example.luma_scan.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findTop20ByOrderByCreatedAtDesc();

    List<StockTransaction> findByActionOrderByCreatedAtDesc(String action);
}
