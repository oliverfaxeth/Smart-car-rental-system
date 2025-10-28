package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.BookingRequest;
import com.nextcar.carrental.dto.BookingConfirmation;
import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.service.RentalService;
import org.springframework.web.bind.annotation.*;

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
                request.getCustomerId().longValue(), // för att göra integer till en Long
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
}

