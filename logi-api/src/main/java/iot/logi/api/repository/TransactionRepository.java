package iot.logi.api.repository;

import iot.logi.api.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT COUNT(t) > 0 FROM Transaction t " +
            "WHERE (t.vehicle.id = :vehicleId OR t.driver.id = :driverId) " +
            "AND (t.dispatchTime IS NOT NULL AND t.arrivalTime IS NULL)")
    boolean hasOngoingTransaction(
            @Param("vehicleId") Long vehicleId,
            @Param("driverId") Long driverId);
}
