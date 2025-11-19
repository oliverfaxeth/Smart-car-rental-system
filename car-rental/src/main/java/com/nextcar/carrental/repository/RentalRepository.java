package com.nextcar.carrental.repository;

import com.nextcar.carrental.dto.CustomerBookingDTO;
import com.nextcar.carrental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    @Query("SELECT r FROM Rental r WHERE r.car.id = :carId AND r.endDate >= :startDate AND r.startDate <= :endDate")
    List<Rental> findRentalsByCarAndDateRange(@Param("carId") Long carId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);


    /*@Query("""
   SELECT new com.nextcar.carrental.dto.CustomerBookingDTO(
        c.brand,
        c.model,
        c.regNr,
        c.year,
        c.fuel,
        c.transmission,
        r.id,
        r.status,
        r.startDate,
        r.endDate,
        r.rentalDate,
        r.bookingNumber,
        p.amount,
        cat.name
   )
   FROM Rental r
   JOIN r.car c
   JOIN c.category cat
   JOIN r.payment p
   WHERE r.customer.id = :customerId
""")*/
    @Query("SELECT r FROM Rental r " +
            "JOIN FETCH r.car " +                           // The JOIN FETCH tells JPA to fetch the associated entities (car, customer, payment)
            "JOIN FETCH r.customer " +                      // eagerly in the same query, instead of loading them lazily later.
            "JOIN FETCH r.payment " +
            "WHERE r.customer.id = :customerId")
    List<Rental> findBookingsByCustomerId(@Param("customerId") Long customerId);
}
