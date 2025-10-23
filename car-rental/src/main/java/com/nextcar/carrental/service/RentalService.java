package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.Optional;

import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalRepository rentalRepository;

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
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

}
