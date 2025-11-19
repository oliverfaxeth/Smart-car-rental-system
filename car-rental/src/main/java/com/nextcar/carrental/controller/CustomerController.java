package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;
import com.nextcar.carrental.dto.CustomerProfileDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.service.CustomerService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
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

//    @GetMapping("/me")
//    public ResponseEntity<?> getMyProfile(Authentication authentication) {
//        if (authentication == null) {
//            return ResponseEntity.status(401).body("Unauthenticated");
//        }
//
//        String email = (String) authentication.getPrincipal();
//        CustomerProfileDTO profile = customerService.getMyProfile(email);
//        return ResponseEntity.ok(profile);
//    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid token");
            }

            String token = authHeader.substring(7);

            if (!jwtTokenUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            String email = jwtTokenUtil.getEmailFromToken(token);

            CustomerProfileDTO profile = customerService.getMyProfile(email);
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }



    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody CustomerProfileDTO dto,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.substring(7);
            CustomerProfileDTO updated = customerService.updateMyProfile(token, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
