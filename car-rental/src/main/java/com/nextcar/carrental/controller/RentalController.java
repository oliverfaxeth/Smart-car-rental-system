package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.BookingRequest;
import com.nextcar.carrental.dto.BookingConfirmation;
import com.nextcar.carrental.dto.CustomerBookingDTO;
import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.service.RentalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public BookingConfirmation createRental(@RequestBody BookingRequest request) {

        Rental rental = rentalService.createBooking(
                request.getCarId(),
                request.getCustomerEmail(),
                request.getStartDate(),
                request.getEndDate()
        );

        BookingConfirmation confirmation = new BookingConfirmation();
        confirmation.setBookingNumber(rental.getBookingNumber()); // hämtas direkt från MySQL
        confirmation.setCarBrand(rental.getCar().getBrand());
        confirmation.setCarModel(rental.getCar().getModel());
        confirmation.setCustomerName(rental.getCustomer().getFirstName() + " " + rental.getCustomer().getLastName());
        confirmation.setStartDate(rental.getStartDate().toString());
        confirmation.setEndDate(rental.getEndDate().toString());
        confirmation.setTotalDays((int) java.time.temporal.ChronoUnit.DAYS.between(rental.getStartDate(), rental.getEndDate()) + 1);
        confirmation.setTotalPrice(rental.getPayment().getAmount());

        return confirmation;
    }

    // GET /rentals/customer/{customerId} - Hämta alla bokningar för en specifik kund
    // Detta används för "Mina Bokningar" sidan
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<List<CustomerBookingDTO>> getRentalsByCustomerId(@PathVariable Long customerId) {
        List<CustomerBookingDTO> customerRentals = rentalService.getBookingsDTOByCustomerId(customerId);
        return ResponseEntity.ok(customerRentals);
    }

    // PUT /rentals/{rentalId}/cancel - Avboka en specifik bokning
    // Ändrar status från ACTIVE till CANCELLED
    @PutMapping("/{rentalId}/cancel")
    public ResponseEntity<String> cancelRental(@PathVariable Long rentalId) {
        // Försök att avboka bokningen
        boolean success = rentalService.cancelRental(rentalId);

        if (success) {
            // Avbokning lyckades
            return ResponseEntity.ok("Din bokning har avbokats");
        } else {
            // Avbokning misslyckades - antingen finns inte bokningen eller kan inte avbokas
            Optional<Rental> rental = rentalService.getRentalById(rentalId);

            if (rental.isEmpty()) {
                // Bokningen finns inte
                return ResponseEntity.notFound().build();
            } else {
                // Bokningen finns men kan inte avbokas
                return ResponseEntity.badRequest()
                        .body("Bokningen kan inte avbokas eftersom startdatumet har passerat eller bokningen redan är avslutad");
            }
        }
    }

    // GET /rentals/{rentalId} - Hämta en specifik bokning
    // Används för att visa bokningsdetaljer och verifiera ägarskap
    @GetMapping("/{rentalId}")
    public ResponseEntity<Rental> getRentalById(@PathVariable Long rentalId) {
        Optional<Rental> rental = rentalService.getRentalById(rentalId);

        if (rental.isPresent()) {
            return ResponseEntity.ok(rental.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}

