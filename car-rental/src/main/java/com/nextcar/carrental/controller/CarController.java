package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CarResponseDTO;
import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.entity.CarsCategory;
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
    public ResponseEntity<List<CarResponseDTO>> getAllCars() {
        List<CarResponseDTO> cars = carService.getAllCars();
        return ResponseEntity.ok(cars);
    }

    // GET /cars/available?startDate=2024-10-15&endDate=2024-10-20&categoryId=1
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCars(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) CarsCategory category,
            @RequestParam(required = false, defaultValue = "asc") String sort){



        // Om alla valideringar är OK, hämta tillgängliga bilar (med eller utan kategorifilter)
        List<CarResponseDTO> availableCarsDTO = carService.userInputValidation(startDate, endDate, category, sort);

        return ResponseEntity.ok(availableCarsDTO);
    }



    // GET /cars/5 - Hämta en specifik bil
    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        Car car = carService.getCarById(id);
        if (car != null) {
            return ResponseEntity.ok(car);
        }
        return ResponseEntity.notFound().build();
    }

    // Metoderna under ska låsas för ADMIN

    // POST /cars - Skapa ny bil (admin)
    @PostMapping
    public ResponseEntity<Car> createCar(@RequestBody Car car) {
        Car savedCar = carService.saveCar(car);
        return ResponseEntity.ok(savedCar);
    }

    // PUT /cars/5 - Uppdatera bil (admin)
    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody Car car) {
        car.setId(id);
        Car updatedCar = carService.saveCar(car);
        return ResponseEntity.ok(updatedCar);
    }

    // DELETE /cars/5 - Ta bort bil (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}