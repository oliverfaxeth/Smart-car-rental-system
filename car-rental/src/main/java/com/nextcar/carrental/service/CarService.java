package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.repository.CarRepository;
import com.nextcar.carrental.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private RentalRepository rentalRepository;



    // Hämta alla bilar
    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    // Hämta en bil via ID
    public Car getCarById(Integer id) {
        return carRepository.findById(id).orElse(null);
    }

    // Spara eller uppdatera en bil
    public Car saveCar(Car car) {
        return carRepository.save(car);
    }

    // Ta bort en bil
    public void deleteCar(Integer id) {
        carRepository.deleteById(id);
    }

    // Hitta tillgängliga bilar baserat på datumintervall
    public List<Car> getAvailableCars(LocalDate startDate, LocalDate endDate) {
        // 1. Hämta alla bilar
        List<Car> allCars = carRepository.findAll();

        // 2. Hämta alla bokningar
        List<Rental> allRentals = rentalRepository.findAll();

        // 3. Filtrera bort bilar som är bokade under det valda datumintervallet
        List<Car> availableCars = allCars.stream()
                .filter(car -> isCarAvailable(car.getId(), startDate, endDate, allRentals))
                .collect(Collectors.toList());

        return availableCars;
    }

    // Hjälpmetod: Kolla om en bil är tillgänglig
    private boolean isCarAvailable(Integer carId, LocalDate startDate, LocalDate endDate, List<Rental> allRentals) {
        // Kolla om det finns någon bokning som överlappar
        for (Rental rental : allRentals) {
            if (rental.getCar().getId().equals(carId)) {
                // Kolla om datumen överlappar
                boolean overlaps = !(endDate.isBefore(rental.getStartDate()) || startDate.isAfter(rental.getEndDate()));
                if (overlaps) {
                    return false; // Bilen är INTE tillgänglig
                }
            }
        }
        return true; // Bilen är tillgänglig
    }

}