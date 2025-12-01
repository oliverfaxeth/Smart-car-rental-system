package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CarResponseDTO;
import com.nextcar.carrental.dto.LoginResponseDTO;
import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.entity.CarsCategory;
import com.nextcar.carrental.security.JwtTokenUtil;
import com.nextcar.carrental.service.CarService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.juli.logging.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// Controller tar emot HTTP-requests från
// frontend (GET, POST, PUT, DELETE) och returnerar data.

@RestController
@RequestMapping("/cars")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

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

    // CREATE CAR

    /*{
        "brand": "Tesla",
            "model": "Model Y",
            "year": 2021,
            "fuel": "El",
            "transmission": "Automat",
            "category": {
        "id": 2,
                "name": "SUV"
    },
        "seats": 5,
            "regNr": "XCS392",
            "price": "860",
            "imageUrl": "willbeupdated"
    }*/
    // POST /cars - Skapa ny bil (admin)
    // Authorization Bearer ${TOKEN} i header + Car JSON objekt i Body
    // 401 ifall Customer försöker komma åt endpointen
    // 500 ifall om något oväntat fel inträffar
    @PostMapping
    public ResponseEntity<?> createCar(HttpServletRequest request, @RequestBody Car car) {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid token");
            }

            String token = authHeader.substring(7);
            String role = jwtTokenUtil.getRoleFromToken(token);

            if (!jwtTokenUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            if ("CUSTOMER".equals(role)){
                return ResponseEntity.status(401).body("Unauthorized");
            }


            Car savedCar = carService.saveCar(car, token);
            return ResponseEntity.ok(savedCar);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // PUT /cars/5 - Uppdatera bil (admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCar(HttpServletRequest request ,@PathVariable Long id, @RequestBody Car car) {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid token");
            }

            String token = authHeader.substring(7);
            String role = jwtTokenUtil.getRoleFromToken(token);

            if (!jwtTokenUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            if ("CUSTOMER".equals(role)){
                return ResponseEntity.status(401).body("Unauthorized");
            }


            car.setId(id);
            Car updatedCar = carService.saveCar(car, token);
            return ResponseEntity.ok(updatedCar);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // DELETE /cars/5 - Ta bort bil (admin)
    // Returnerar 204 BÅDE till admin och customer
    // Endast 204 för admin ändrar i Databasen
    // DELETE operation sker bara med Admins token även om de returnerar samma status
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCar(@PathVariable Long id, @RequestBody LoginResponseDTO loginResponseDTO) {
        String token = loginResponseDTO.getToken();
        carService.deleteCar(id, token);
        return ResponseEntity.noContent().build();
    }
}