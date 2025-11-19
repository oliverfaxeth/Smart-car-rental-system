package com.nextcar.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false) // customer_id i db
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "car_id", nullable = false) // car_id i db
    private Car car;

    @ManyToOne
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "rental_date", nullable = false)
    private LocalDate rentalDate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Status-fält för att hantera bokningens tillstånd
    // ACTIVE = pågående bokning, CANCELLED = avbokad, COMPLETED = genomförd
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // Default-värde för nya bokningar

    @Column(name = "booking_number", nullable = false)
    private String bookingNumber;

    // Getters och setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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


    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
    }
}
