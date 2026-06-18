package luma.example.luma_scan.repository;

import luma.example.luma_scan.entity.DetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetectionResultRepository extends JpaRepository<DetectionResult, Long> {
    @Query("select d from DetectionResult d join fetch d.product order by d.detectedAt desc")
    List<DetectionResult> findRecentWithProduct();
}
