package com.nextcar.carrental.repository;

import com.nextcar.carrental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Integer> {

    @Query("SELECT r FROM Rental r WHERE r.car.id = :carId AND r.endDate >= :startDate AND r.startDate <= :endDate")
    List<Rental> findRentalsByCarAndDateRange(@Param("carId") Integer carId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);


}
