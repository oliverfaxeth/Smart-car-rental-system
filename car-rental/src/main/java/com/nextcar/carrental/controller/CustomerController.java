package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;
import com.nextcar.carrental.dto.CustomerUpdateDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.nextcar.carrental.security.JwtTokenUtil;


@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomerService customerService;

    // GET all customers
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // GET customer by ID
    @GetMapping("/{id}")
    public Optional<Customer> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }


    // {
    //  "firstName": "Test",
    //  "lastName": "Testsson",
    //  "email": "test@example.com",
    //  "password": "password123",
    //  "confirmPassword": "password123",
    //  "address": "Testgatan 1",
    //  "postalCode": "123 45",
    //  "city": "Stockholm",
    //  "country": "Sverige",
    //  "phone": "0701234567"
    //}
    // POST /customers/register - Registrera ny kund
    @PostMapping("/register")
    public ResponseEntity<String> registerCustomer(@RequestBody CustomerRegistrationDTO dto) {
        String result = customerService.registerCustomer(dto);

        if (result.equals("SUCCESS")) {
            return ResponseEntity.ok("Registrering lyckades! Du kan nu logga in.");
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/me") //Endpoint för att HÄMTA (GetMapping) inloggad kunds egna uppgifter (kräver JWT-token)
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization")String authHeader) {
        try {
            // 1. Hämta JWT-token från Authorization-headern ("Bearer <token>")
            String token = authHeader.substring(7);

            // 2. Hämta userId från token
            Integer userId = jwtTokenUtil.getUserIdFromToken(token);

            // 3. Hämta kund från databasen med userId
            Optional<Customer> optionalCustomer = customerService.getCustomerById(Long.valueOf(userId));

            // 4. Om kunden inte finns i databasen så returnera 404
            if (optionalCustomer.isEmpty()) {
                return ResponseEntity.status(404).body("Kund hittades inte");
            }

            // 5. Hämta kundobjektet
            Customer customer = optionalCustomer.get();

            // 6. Skicka tillbaka kundens egen info
            // OBS: Lösenordet skickas EJ tillbaka!
            Map<String, Object> response = new HashMap<>();
            response.put("firstName", customer.getFirstName());
            response.put("lastName", customer.getLastName());
            response.put("email", customer.getEmail());
            response.put("phone", customer.getPhone());
            response.put("address", customer.getAddress());
            response.put("postalCode", customer.getPostalCode());
            response.put("city", customer.getCity());
            response.put("country", customer.getCountry());

            return ResponseEntity.ok(response);

        } catch (Exception error) {
            // Om ingen token skickas eller token är ogiltig så 401 Unauthorized
            return ResponseEntity.status(401).body("Token är ogiltig eller saknas");
        }
    }

    @PutMapping("/me") //Endpoint för att användaren ska kunna UPPDATERA (PutMapping) sitt förnamn, efternamn och telefonnummer
    public ResponseEntity<?> updateMyProfile(@RequestBody CustomerUpdateDTO customerUpdateDTO,
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // remove "Bearer "
            Integer userId = jwtTokenUtil.getUserIdFromToken(token);
            String role = jwtTokenUtil.getRoleFromToken(token);

            if (!role.equals("CUSTOMER")) {
                return ResponseEntity.status(403).body("Endast kunder kan uppdatera sin profil");
            }

            Customer updatedCustomer = customerService.updateCustomer(userId, customerUpdateDTO);

            return ResponseEntity.ok("Uppgifterna är uppdaterade");

        } catch (Exception error) {
            return ResponseEntity.status(400).body("Uppgifterna kunde inte uppdateras");
        }
    }
}
