package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CarResponseDTO;
import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.entity.CarsCategory;
import com.nextcar.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // GET /cars/active - Hämta endast aktiva bilar (för kunder)
    @GetMapping("/active")
    public ResponseEntity<List<Car>> getActiveCars() {
        List<Car> activeCars = carService.getActiveCars();
        return ResponseEntity.ok(activeCars);
    }

    // GET /cars/available?startDate=2024-10-15&endDate=2024-10-20&categoryId=1
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCars(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) CarsCategory category,
            @RequestParam(required = false, defaultValue = "asc") String sort){

        // Validering 1: Kolla att parametrarna inte är null eller tomma
        if (startDate == null || startDate.isEmpty() || endDate == null || endDate.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Både startdatum och slutdatum måste anges");
        }

        // Konvertera String till LocalDate
        LocalDate start;
        LocalDate end;

        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Ogiltigt datumformat. Använd format: YYYY-MM-DD");
        }

        // Validering 2: Startdatum kan inte vara tidigare än dagens datum
        LocalDate today = LocalDate.now();
        if (start.isBefore(today)) { // BLOCKERAR TIDIGARE DATUM & IDAG
            return ResponseEntity.badRequest()
                    .body("Startdatum måste vara efter dagens datum");
        }

        // Validering 3: Slutdatum måste vara minst 1 dag efter startdatum
        if (!end.isAfter(start)) {
            return ResponseEntity.badRequest()
                    .body("Slutdatum måste vara minst 1 dag efter startdatum");
        }

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
    // POST /cars - Skapa ny bil (admin) - FÖRBÄTTRAD MED VALIDATION
    @PostMapping
    public ResponseEntity<?> createCar(@Valid @RequestBody Car car, BindingResult bindingResult) {

        // Kontrollera validation-fel från @Valid annotationer
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();

            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }

            // Returnera strukturerad felresponse med HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Validering misslyckades",
                    "errors", errors
            ));
        }

        try {
            // Spara bilen via service
            Car savedCar = carService.saveCar(car);

            // Returnera skapad bil med HTTP 201 Created + success-meddelande
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Bil tillagd", // Enligt acceptanskriterier
                    "car", savedCar
            ));

        } catch (Exception e) {
            // Hantera oväntat fel (t.ex. databas-fel, dubbletter)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Ett fel uppstod när bilen skulle sparas: " + e.getMessage()
            ));
        }
    }

    // PUT /cars/5 - Uppdatera bil (admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCar(@PathVariable Integer id, @Valid @RequestBody Car car, BindingResult bindingResult) {

        // Kontrollera validation-fel
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();

            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Validering misslyckades",
                    "errors", errors
            ));
        }

        try {
            car.setId(id);
            Car updatedCar = carService.saveCar(car);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bil uppdaterad",
                    "car", updatedCar
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Ett fel uppstod när bilen skulle uppdateras: " + e.getMessage()
            ));
        }
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody Car car) {
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

    // PATCH /cars/5/status - Uppdatera bil-status (ACTIVE/INACTIVE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateCarStatus(@PathVariable Integer id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");

            // Validera status
            if (!"ACTIVE".equals(newStatus) && !"INACTIVE".equals(newStatus)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Status måste vara ACTIVE eller INACTIVE"
                ));
            }

            // Hämta bil
            Car car = carService.getCarById(id);
            if (car == null) {
                return ResponseEntity.notFound().build();
            }

            // Uppdatera status
            car.setStatus(newStatus);
            Car updatedCar = carService.saveCar(car);

            String message = "ACTIVE".equals(newStatus) ? "Bil aktiverad" : "Bil inaktiverad";

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", message,
                    "car", updatedCar
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Ett fel uppstod när bilens status skulle uppdateras: " + e.getMessage()
            ));
        }
    }

    // Global felhantering för validation-exceptions (backup)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Validering misslyckades",
                "errors", errors
        ));
    }
}