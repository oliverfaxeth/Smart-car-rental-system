package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.*;
import com.nextcar.carrental.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import java.math.BigDecimal;
import java.time.LocalDate;

@PersistenceContext // För att kunna hämta booking number från db till backend direkt med hjälp av entityManager
@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final EntityManager entityManager;

    public RentalService(RentalRepository rentalRepository, CarRepository carRepository,
                         CustomerRepository customerRepository, PaymentRepository paymentRepository, EntityManager entityManager) {
        this.rentalRepository = rentalRepository;
        this.carRepository = carRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.entityManager = entityManager;
    }

    // Hämta alla bokningar för en specifik kund
    // Detta används för att visa "Mina Bokningar" sidan
    public List<Rental> getRentalsByCustomerId(Integer customerId) {
        return rentalRepository.findAll()
                .stream()
                .filter(rental -> rental.getCustomer().getId().equals(customerId))
                .collect(Collectors.toList());
    }

    // Avboka en bokning - ändrar status från ACTIVE till CANCELLED
    // Returnerar true om avbokningen lyckades, false om den inte kunde avbokas
    public boolean cancelRental(Integer rentalId) {
        // Hitta bokningen i databasen
        Optional<Rental> rentalOptional = rentalRepository.findById(rentalId);

        if (rentalOptional.isEmpty()) {
            // Bokningen finns inte
            return false;
        }

        Rental rental = rentalOptional.get();

        // Kontrollera om bokningen kan avbokas
        // Använder vår canBeCancelled() metod från Rental-entiteten
        if (!rental.canBeCancelled()) {
            // Bokningen kan inte avbokas (antingen redan genomförd eller redan startad)
            return false;
        }

        // Ändra status till CANCELLED
        rental.setStatus("CANCELLED");

        // Spara ändringen i databasen
        rentalRepository.save(rental);

        return true;
    }

    // Hämta en specifik bokning via ID
    // Detta behövs för att verifiera att en bokning tillhör rätt kund
    public Optional<Rental> getRentalById(Integer rentalId) {
        return rentalRepository.findById(rentalId);
    }
    @Transactional
    public Rental createBooking(Integer carId, Long customerId, LocalDate startDate, LocalDate endDate) {

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Kontrollera om bilen är ledig
        boolean available = rentalRepository.findRentalsByCarAndDateRange(carId, startDate, endDate).isEmpty();
        if (!available) {
            throw new RuntimeException("Car is already booked for these dates");
        }

        // Skapa betalning (MVP: godkänd direkt)
        Payment payment = new Payment();
        payment.setMethod("Cash"); // Default, Här sätts betalningsmetoden automatiskt
        payment.setAmount(car.getPrice().multiply(BigDecimal.valueOf(calculateDays(startDate, endDate))));
        payment.setPaymentDate(LocalDate.now());
        paymentRepository.save(payment);

        // Skapa rental
        Rental rental = new Rental();
        rental.setCar(car);
        rental.setCustomer(customer);
        rental.setPayment(payment);
        rental.setRentalDate(LocalDate.now());
        rental.setStartDate(startDate);
        rental.setEndDate(endDate);
        rental.setStatus("ACTIVE");
        // Databasen genererar automatiskt ett booking_number med dagensdatum + 001 (upp till 999)

        Rental savedRental = rentalRepository.save(rental);
        entityManager.refresh(savedRental); // Refreshar från databasen den CREATEADE BOOKING
        return savedRental; // Lämnar tillbaka bokningen med automatiskt genererad booking_number
    }

    private long calculateDays(LocalDate start, LocalDate end) {
        return java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
    }
}




