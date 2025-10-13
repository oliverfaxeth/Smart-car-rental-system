package com.nextcar.carrental.controller;

import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Controller tar emot HTTP-requests från
// frontend (GET, POST, PUT, DELETE) och returnerar data.

@RestController
@RequestMapping("/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    @Autowired
    private CarService carService;

    // GET /cars - Hämta alla bilar
    @GetMapping
    public ResponseEntity<List<Car>> getAllCars() {
        List<Car> cars = carService.getAllCars();
        return ResponseEntity.ok(cars);
    }

    // GET /cars/available?startDate=2024-10-15&endDate=2024-10-20
    @GetMapping("/available")
    public ResponseEntity<List<Car>> getAvailableCars(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        // Konvertera String till LocalDate
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        // Hämta tillgängliga bilar
        List<Car> availableCars = carService.getAvailableCars(start, end);

        return ResponseEntity.ok(availableCars);
    }

    // GET /cars/5 - Hämta en specifik bil
    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Integer id) {
        Car car = carService.getCarById(id);
        if (car != null) {
            return ResponseEntity.ok(car);
        }
        return ResponseEntity.notFound().build();
    }

    // POST /cars - Skapa ny bil (admin)
    @PostMapping
    public ResponseEntity<Car> createCar(@RequestBody Car car) {
        Car savedCar = carService.saveCar(car);
        return ResponseEntity.ok(savedCar);
    }

    // PUT /cars/5 - Uppdatera bil (admin)
    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Integer id, @RequestBody Car car) {
        car.setId(id);
        Car updatedCar = carService.saveCar(car);
        return ResponseEntity.ok(updatedCar);
    }

    // DELETE /cars/5 - Ta bort bil (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Integer id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}