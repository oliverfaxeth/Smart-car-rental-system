package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.BookingRequest;
import com.nextcar.carrental.dto.BookingConfirmation;
import com.nextcar.carrental.dto.CustomerBookingDTO;
import com.nextcar.carrental.dto.LoginResponseDTO;
import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.security.JwtTokenUtil;
import com.nextcar.carrental.service.RentalService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rentals")
public class RentalController {

    private RentalService rentalService;

    private JwtTokenUtil jwtTokenUtil;

    public RentalController(RentalService rentalService, JwtTokenUtil jwtTokenUtil) {
        this.rentalService = rentalService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    // FÖR ADMIN & CUSTOMER
    // Token hämtas från headern (Standard Bearer-format)
    // BookingRequest i body (customerEmail för customers hämtas i token) (customerEmails sätts till valfri användare av Admin)
    @PostMapping
    public ResponseEntity<BookingConfirmation> createRental(
            @RequestBody BookingRequest request,
            @RequestHeader("Authorization") String authHeader) throws AccessDeniedException, BadRequestException {

        // Extrahera Bearer-token (ignorerar "Bearer " prefixet)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new org.springframework.security.authentication.BadCredentialsException("Missing or invalid token format.");
        }
        String token = authHeader.substring(7);


        Rental rental = rentalService.createBooking(
                request.getCarId(),
                request.getCustomerEmail(),
                request.getStartDate(),
                request.getEndDate(),
                token // Skickar med token
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

        // Returnerar 201 Created med bekräftelsen i kroppen
        return ResponseEntity.status(HttpStatus.CREATED).body(confirmation);
    }

    // FÖR CUSTOMER -- Hämtar alla bokningar av inloggad customers token i body. Endpoint GET/rentals/my-bookings
    // Detta används för "Mina Bokningar" sidan

    // FÖR ADMIN -- Hämtar alla bokningar gjorda
    @GetMapping("/my-bookings")
    public ResponseEntity<List<CustomerBookingDTO>> getRentalsByCustomer(@RequestBody LoginResponseDTO loginResponseDTO) {

        List<CustomerBookingDTO> customerRentals = rentalService.getBookingsDTOByUser(loginResponseDTO.getToken());
        return ResponseEntity.ok(customerRentals);

    }

    // FÖR CUSTOMER -- Kan avboka en specifik bokning kopplad till deras Token via PUT /rentals/{rentalId}/cancel
    // Ändrar status från ACTIVE till CANCELLED

    // FÖR ADMIN -- Kan avboka en vilken bokning som helst via rentalId
    @PutMapping("/{rentalId}/cancel")
    public ResponseEntity<String> cancelRental(@RequestBody LoginResponseDTO loginResponseDTO, @PathVariable Long rentalId) {
        // Försök att avboka bokningen
        boolean success = rentalService.cancelRental(loginResponseDTO.getToken(), rentalId);

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
                return ResponseEntity.badRequest()
                        .body("Bokningen kan inte avbokas ( Auktoriserings fel / Bilen är redan avbokad");
            }
        }
    }

    // FÖR CUSTOMER -- Kan se/hämta en specifik bokning kopplad till deras Token via PUT /rentals/{rentalId}

    // FÖR ADMIN -- Kan se/hämta vilken bokning som helst via rentalId
    @GetMapping("/{rentalId}")
    public ResponseEntity<CustomerBookingDTO> getRentalById(@PathVariable Long rentalId, @RequestBody LoginResponseDTO loginResponseDTO) {
        CustomerBookingDTO rental = rentalService.getRentalDTOById(loginResponseDTO.getToken(), rentalId);

        return ResponseEntity.ok(rental);
    }
}

