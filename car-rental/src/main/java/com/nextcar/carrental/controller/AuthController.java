package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.LoginDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import com.nextcar.carrental.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
/*@RequestMapping("")
@CrossOrigin(origins = "http://localhost:3000")*/
public class AuthController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    /**
     * Handles user login requests.
     * @param loginDTO contains email and password
     * @return JWT token if login is successful
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {

        // 1. Find customer by email
        Optional<Customer> customerOptional = customerRepository.findByEmail(loginDTO.getEmail());

        if (customerOptional.isPresent()) {
            Customer customer = customerOptional.get();

            // 2. Verify password
            if (passwordEncoder.matches(loginDTO.getPassword(), customer.getPassword())) {
                // 3. Generate JWT token (includes userId + role)
                String token = jwtTokenUtil.generateToken(customer);

                return ResponseEntity.ok(token);
            }
        }

        // 4. Invalid login
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Felaktig mail eller felaktigt lösenord");
    }
}
