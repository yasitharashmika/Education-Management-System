package com.example.emsbackend.repository;

import com.example.emsbackend.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Integer> {

    // Existing Dashboard Procedure
    @Query(value = "EXEC sp_GetDashboardMetrics", nativeQuery = true)
    List<Object[]> callDashboardStoredProcedure();

    // NEW: Payment Procedure for Audit Logging
    @Modifying
    @Transactional
    @Query(value = "EXEC sp_RecordFeePayment :studentId, :amount, :method", nativeQuery = true)
    void recordFeePaymentProc(
            @Param("studentId") Integer studentId,
            @Param("amount") Double amount,
            @Param("method") String method
    );
}