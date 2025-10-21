package com.nextcar.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customersId", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "carsId", nullable = false)
    private Car car;

    @ManyToOne
    @JoinColumn(name = "paymentId", nullable = false)
    private Payment payment;

    @Column(nullable = false)
    private LocalDate rentalDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Status-fält för att hantera bokningens tillstånd
    // ACTIVE = pågående bokning, CANCELLED = avbokad, COMPLETED = genomförd
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // Default-värde för nya bokningar

    // Befintliga getters och setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public LocalDate getRentalDate() { return rentalDate; }
    public void setRentalDate(LocalDate rentalDate) { this.rentalDate = rentalDate; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Hjälpmetoder för att kontrollera bokningsstatus
    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(this.status);
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(this.status);
    }

    // Kontrollerar om bokningen kan avbokas
    // En bokning kan endast avbokas om den är aktiv OCH startdatumet har inte passerat
    public boolean canBeCancelled() {
        LocalDate today = LocalDate.now();
        return isActive() && startDate.isAfter(today);
    }
}