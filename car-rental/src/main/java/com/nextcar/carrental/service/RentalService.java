package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.CustomerBookingDTO;
import com.nextcar.carrental.entity.*;
import com.nextcar.carrental.repository.*;
import com.nextcar.carrental.security.JwtTokenUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final CustomerService customerService;
    private final PaymentRepository paymentRepository;
    private final EntityManager entityManager;
    private JwtTokenUtil jwtTokenUtil;

    public RentalService(RentalRepository rentalRepository, CarRepository carRepository,
                         CustomerRepository customerRepository, CustomerService customerService, PaymentRepository paymentRepository, EntityManager entityManager, JwtTokenUtil jwtTokenUtil) {
        this.rentalRepository = rentalRepository;
        this.carRepository = carRepository;
        this.customerRepository = customerRepository;
        this.customerService = customerService;
        this.paymentRepository = paymentRepository;
        this.entityManager = entityManager;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    // Hämta alla bokningar för en specifik kund
    // Detta används för att visa "Mina Bokningar" sidan
    public List<CustomerBookingDTO> getBookingsDTOByUser(String token) {
        List<CustomerBookingDTO> customerBookingDTOList = new ArrayList<>();

        try {
            // 1) Extraherar email från Token
            String email = jwtTokenUtil.getEmailFromToken(token);
            // 2) Extraherar role från Token
            String role = jwtTokenUtil.getRoleFromToken(token);

            // 3) Skapar en lista redo att populeras med antigen Admins metod eller Customer
            List<Rental> rentals;

            // 4) Kollar ifall en admin är inloggad via Token
            if("ADMIN".equals(role)){

                // 5) Populerar listan med alla customers rentals
                rentals = rentalRepository.findAll();

            } else {

                // 6) Hämtar customer objektet från databasen baserat på email
                Customer customer = customerRepository.findByEmail(email).get();
                // 7) Populerar listan med alla rentals för den specifika customer
                rentals = rentalRepository.findBookingsByCustomerId(customer.getId());
            }
            for (Rental rental : rentals) {
                CustomerBookingDTO customerBookingDTO = new CustomerBookingDTO(rental);
                customerBookingDTOList.add(customerBookingDTO);
                System.out.println("Customer Email: " + customerBookingDTO.getCustomerEmail());
            }
            return customerBookingDTOList;

        } catch (Exception e) {
            // Returnerar en tom lista ifall ingen token stämmer överens
            return new ArrayList<>();
        }
    }

    // Avboka en bokning - ändrar status från ACTIVE till CANCELLED
    // Returnerar true om avbokningen lyckades, false om den inte kunde avbokas
    public boolean cancelRental(String token, Long rentalId) {

        String email = jwtTokenUtil.getEmailFromToken(token);
        String role = jwtTokenUtil.getRoleFromToken(token);

        Optional<Rental> rentalOptional;

        if ("ADMIN".equals(role)){
            rentalOptional = rentalRepository.findById(rentalId);
        } else {
            Customer customer = customerService.findByEmail(email);
            rentalOptional = rentalRepository.findByIdAndCustomerId(rentalId, customer.getId());
        }


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

    // PUT cancel bokning by ID
    public Optional<Rental> getRentalById(Long rentalId) {
        return rentalRepository.findById(rentalId);
    }

    // GET bokning by ID
    public CustomerBookingDTO getRentalDTOById(String token, Long rentalId) {

        // 1. Tomma variablar som fylls med token
        String email;
        String role;


        try {
            email = jwtTokenUtil.getEmailFromToken(token);
            role = jwtTokenUtil.getRoleFromToken(token);

            // 2. Skapar en rental-object som ska mappas till en CustomerBookingDTO att returneras
            Rental rental;

            // 3) Kollar ifall en admin är inloggad via Token
            if ("ADMIN".equals(role)) {
                System.out.println("Admin-åtkomst: Hämtar rental " + rentalId);

                // 4) Admin får hämta vilken rental som helst.
                rental = rentalRepository.findById(rentalId).get();

            } else {
                // 6) Hämta customer objektet från databasen baserat på email
                Customer customer;
                customer = customerService.findByEmail(email);

                // 7) Hämta den specifika Rental-entiteten och kolla ägarskap.
                Optional<Rental> optionalRental = rentalRepository.findByIdAndCustomerId(rentalId, customer.getId());

                    rental = optionalRental.get();
            }

            // 8) Skapar en DTO av rental-object
            CustomerBookingDTO customerBookingDTO = new CustomerBookingDTO(rental);

            System.out.println(customerBookingDTO);

            return customerBookingDTO;
        } // 9) Catch returnerar en tom DTO ifall:
        // ADMIN får EntityException
        // CUSTOMER får AuthorizationException
        catch (Exception e) {
            return new CustomerBookingDTO();
        }
    }


    @Transactional
    public Rental createBooking(Long carId, String customerEmail, LocalDate startDate, LocalDate endDate) {

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        Customer customer = customerRepository.findByEmail(customerEmail)
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
        return ChronoUnit.DAYS.between(start, end) + 1;
    }
}




