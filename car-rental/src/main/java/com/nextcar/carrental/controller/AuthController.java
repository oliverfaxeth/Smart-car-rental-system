package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.LoginDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.nextcar.carrental.security.JwtTokenUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {


    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        // Hämta kund från databas
        Optional<Customer> customerOptional = customerRepository.findByEmail(loginDTO.getEmail());

        if (customerOptional.isPresent()) {
            Customer customer = customerOptional.get();

            // Verifiera lösenord
            if (passwordEncoder.matches(loginDTO.getPassword(), customer.getPassword())) {
                // Generera JWT-token
                String token = jwtTokenUtil.generateToken(customer.getEmail(), "CUSTOMER", customer.getId());

                // Skapa svarsobjekt med token och användarinformation
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", customer.getId());
                response.put("role", "CUSTOMER");
                response.put("firstName", customer.getFirstName());
                response.put("lastName", customer.getLastName());

                return ResponseEntity.ok(response);
            }
        }

        // Felaktig inloggning
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Fel e-post eller lösenord");
    }

}
