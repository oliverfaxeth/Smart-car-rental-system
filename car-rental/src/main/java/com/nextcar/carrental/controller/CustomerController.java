package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;

import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/customers")
public class CustomerController {

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
}
