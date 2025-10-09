package com.nextcar.carrental.controller;

import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller tar emot HTTP-requests från
// frontend (GET, POST, PUT, DELETE) och returnerar data.

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    @Autowired
    private CarService carService;

    // GET /api/cars - Hämta alla bilar
    @GetMapping
    public ResponseEntity<List<Car>> getAllCars() {
        List<Car> cars = carService.getAllCars();
        return ResponseEntity.ok(cars);
    }

    // GET /api/cars/5 - Hämta en specifik bil
    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Integer id) {
        Car car = carService.getCarById(id);
        if (car != null) {
            return ResponseEntity.ok(car);
        }
        return ResponseEntity.notFound().build();
    }

    // POST /api/cars - Skapa ny bil (admin)
    @PostMapping
    public ResponseEntity<Car> createCar(@RequestBody Car car) {
        Car savedCar = carService.saveCar(car);
        return ResponseEntity.ok(savedCar);
    }

    // PUT /api/cars/5 - Uppdatera bil (admin)
    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Integer id, @RequestBody Car car) {
        car.setId(id);
        Car updatedCar = carService.saveCar(car);
        return ResponseEntity.ok(updatedCar);
    }

    // DELETE /api/cars/5 - Ta bort bil (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Integer id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}