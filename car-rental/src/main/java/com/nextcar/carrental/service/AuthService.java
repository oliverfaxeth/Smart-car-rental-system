package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.LoginRequestDTO;
import com.nextcar.carrental.dto.LoginResponseDTO;
import com.nextcar.carrental.entity.Admin;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.AdminRepository;
import com.nextcar.carrental.repository.CustomerRepository;
import com.nextcar.carrental.security.JwtTokenUtil;
import com.nextcar.carrental.security.PasswordEncoderConfig;
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

    @Autowired
    private PasswordEncoderConfig passwordEncoderConfig;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
        String email = loginRequest.getEmail();
        String rawPassword = loginRequest.getPassword();

        // 1) Try customer
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
                if (passwordEncoderConfig.passwordEncoder().matches(rawPassword, customer.getPassword())) {
                    String token = jwtTokenUtil.generateToken(customer.getEmail(), "CUSTOMER");
                    return new LoginResponseDTO(customer.getId(), token, customer.getFirstName(), "CUSTOMER");
                }
        }
        // 2) Try admin
        else if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (passwordEncoderConfig.passwordEncoder().matches(rawPassword, admin.getPassword())) {
                String token = jwtTokenUtil.generateToken(admin.getEmail(), "ADMIN");
                return new LoginResponseDTO(admin.getId(), token, "Admin", "ADMIN");
            }
        }
        // 3) Not found in either
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
