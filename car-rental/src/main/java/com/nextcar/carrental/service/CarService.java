package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.CarResponseDTO;
import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.entity.CarsCategory;
import com.nextcar.carrental.entity.Rental;
import com.nextcar.carrental.repository.CarRepository;
import com.nextcar.carrental.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private RentalRepository rentalRepository;



    // Hämta alla bilar
    public List<CarResponseDTO> getAllCars() {
        List<Car> list = carRepository.findAll();
        return list.stream().map(
                car -> new CarResponseDTO(
                        car.getBrand(),
                        car.getModel(),
                        car.getYear(),
                        car.getFuel(),
                        car.getTransmission(),
                        car.getCategory(),
                        car.getSeats(),
                        car.getPrice(),
                        car.getImageUrl()))
                        .collect(Collectors.toList());
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

    // Hitta tillgängliga bilar baserat på datumintervall OCH kategori
    public List<CarResponseDTO> getAvailableCars(LocalDate startDate, LocalDate endDate, CarsCategory category, String sort) {
        // 1. Hämta alla bilar
        List<Car> allCars = carRepository.findAll();

        // 2. Filtrera på kategori (om categoryId anges)
        if (category != null) {
            allCars = allCars.stream()
                    .filter(car -> car.getCategory().equals(category))
                    .collect(Collectors.toList());
        }

        // 3. Hämta alla bokningar
        List<Rental> allRentals = rentalRepository.findAll();

        // 4. Filtrera bort bilar som är bokade under det valda datumintervallet
        List<Car> availableCars = allCars.stream()
                .filter(car -> isCarAvailable(car.getId(), startDate, endDate, allRentals))
                .collect(Collectors.toList());

        // 5. Mappa om avaliableCars från Car -> CarResponseDTO
        List<CarResponseDTO> availableCarsDTO = availableCars.stream().map(
                car -> new CarResponseDTO(
                        car.getBrand(),
                        car.getModel(),
                        car.getYear(),
                        car.getFuel(),
                        car.getTransmission(),
                        car.getCategory(),
                        car.getSeats(),
                        car.getPrice(),
                        car.getImageUrl()))
                .collect(Collectors.toList());



        // Om sort är specificerat, sortera bilarna
        if (sort != null && !sort.isEmpty()) {
            availableCarsDTO = sortCars(availableCarsDTO, sort);
        }

        return availableCarsDTO;
    }

    public List<CarResponseDTO> sortCars(List<CarResponseDTO> cars, String sort) {

        List<CarResponseDTO> sortedCars = new ArrayList<>(cars);

        // Sortera bilar efter pris
        if ("desc".equalsIgnoreCase(sort)) {
            sortedCars.sort((a, b) -> b.getPrice().compareTo(a.getPrice()));
        } else {
            // Default är stigande ordning (lägsta först)
            sortedCars.sort(Comparator.comparing(CarResponseDTO::getPrice));
        }

        return sortedCars;
    }

    // Overload: Om inget categoryId anges, visa alla kategorier
    public List<CarResponseDTO> getAvailableCars(LocalDate startDate, LocalDate endDate) {
        return getAvailableCars(startDate, endDate, null, "asc");
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

    public List<CarResponseDTO> userInputValidation(String startDate, String endDate, CarsCategory category, String sort) {
        // Validering 1: Kolla att parametrarna inte är null eller tomma
        if (startDate == null || startDate.isEmpty() || endDate == null || endDate.isEmpty()) {
            //throw new RuntimeException("Både startdatum och slutdatum måste anges");
            throw new IllegalArgumentException("Både startdatum och slutdatum måste anges");
        }

        // Konvertera String till LocalDate
        LocalDate start;
        LocalDate end;

        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (Exception e) {
            throw new IllegalArgumentException("Ogiltigt datumformat. Använd format: YYYY-MM-DD");
        }

        // Validering 2: Startdatum kan inte vara tidigare än dagens datum
        LocalDate today = LocalDate.now();
        if (start.isBefore(today)) { // BLOCKERAR TIDIGARE DATUM & IDAG
            throw new IllegalArgumentException("Startdatum måste vara efter dagens datum");
        }

        // Validering 3: Slutdatum måste vara minst 1 dag efter startdatum
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Slutdatum måste vara minst 1 dag efter startdatum");
        }

        return getAvailableCars(start, end, category, sort);
    }

}