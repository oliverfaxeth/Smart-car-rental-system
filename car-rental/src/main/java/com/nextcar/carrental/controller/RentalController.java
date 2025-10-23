package com.nextcar.carrental.controller;

import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rentals")
public class RentalController {

    @Autowired
    private RentalService rentalService;

    @GetMapping
    public List<Rental> getAllRentals() {
        return rentalService.getAllRentals();
    }

    // GET /rentals/customer/{customerId} - Hämta alla bokningar för en specifik kund
    // Detta används för "Mina Bokningar" sidan
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Rental>> getRentalsByCustomerId(@PathVariable Integer customerId) {
        List<Rental> customerRentals = rentalService.getRentalsByCustomerId(customerId);
        return ResponseEntity.ok(customerRentals);
    }

    // PUT /rentals/{rentalId}/cancel - Avboka en specifik bokning
    // Ändrar status från ACTIVE till CANCELLED
    @PutMapping("/{rentalId}/cancel")
    public ResponseEntity<String> cancelRental(@PathVariable Integer rentalId) {
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
    public ResponseEntity<Rental> getRentalById(@PathVariable Integer rentalId) {
        Optional<Rental> rental = rentalService.getRentalById(rentalId);

        if (rental.isPresent()) {
            return ResponseEntity.ok(rental.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
