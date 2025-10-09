package com.nextcar.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDate;


//

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer customerId;

    @Column(nullable = false)
    private Integer carId;

    @Column(nullable = false)
    private LocalDate rentalDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column
    private Integer paymentId;

    // Constructors
    public Rental() {
    }

    public Rental(Integer id, Integer customerId, Integer carId, LocalDate rentalDate,
                  LocalDate startDate, LocalDate endDate, Integer paymentId) {
        this.id = id;
        this.customerId = customerId;
        this.carId = carId;
        this.rentalDate = rentalDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.paymentId = paymentId;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getCarId() {
        return carId;
    }

    public void setCarId(Integer carId) {
        this.carId = carId;
    }

    public LocalDate getRentalDate() {
        return rentalDate;
    }

    public void setRentalDate(LocalDate rentalDate) {
        this.rentalDate = rentalDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    // toString
    @Override
    public String toString() {
        return "Rental{" +
                "id=" + id +
                ", customerId=" + customerId +
                ", carId=" + carId +
                ", rentalDate=" + rentalDate +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", paymentId=" + paymentId +
                '}';
    }
}