package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import com.nextcar.carrental.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    //Nedan är dokumentation från AI
    /**
     * Attempts to log in a customer.
     * @param email Customer's email
     * @param rawPassword The raw password entered by the user
     * @return JWT token if successful
     */


    public String login(String email, String rawPassword) {
        // 1. Find the customer by email
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Fel e-post"));

        // 2. Check password
        if (!passwordEncoder.matches(rawPassword, customer.getPassword())) {
            throw new RuntimeException("Fel lösenord");
        }

        // 3. Generate JWT token with user ID and role
        return jwtTokenUtil.generateToken(customer);
    }
}
