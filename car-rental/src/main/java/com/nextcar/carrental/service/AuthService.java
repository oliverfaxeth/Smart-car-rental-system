package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.LoginRequestDTO;
import com.nextcar.carrental.dto.LoginResponseDTO;
import com.nextcar.carrental.entity.Admin;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.AdminRepository;
import com.nextcar.carrental.repository.CustomerRepository;
import com.nextcar.carrental.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    //@Autowired
    //private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
        String email = loginRequest.getEmail();
        String rawPassword = loginRequest.getPassword();
        // 1) Try customer
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            //if (passwordEncoder.matches(rawPassword, customer.getPassword())) {
                // Generate token (we include userId claim inside token for server-side use,
                // but we DO NOT return id/email in the response body)
                String token = jwtTokenUtil.generateToken(customer.getEmail(), "CUSTOMER");
                return new LoginResponseDTO(customer.getId(), token, customer.getFirstName(), "CUSTOMER");
            } /*else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        }*/

        // 2) Try admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            //if (passwordEncoder.matches(rawPassword, admin.getPassword())) {
                String token = jwtTokenUtil.generateToken(admin.getEmail(), "ADMIN");
                // For admins we return role and token. We avoid returning id/email; returning names is optional.
                return new LoginResponseDTO(admin.getId(), token, "Admin", "ADMIN");
            /*} else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }*/
        }

        // Not found in either
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
