package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;
import com.nextcar.carrental.dto.CustomerProfileDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import com.nextcar.carrental.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private BCryptPasswordEncoder passwordEncoder;

    private JwtTokenUtil jwtTokenUtil;


    public CustomerService(CustomerRepository customerRepository,
                           JwtTokenUtil jwtTokenUtil,
                           BCryptPasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // Hämta alla kunder
    public List<Customer> getAllCustomers(String token) {
        String role = jwtTokenUtil.getRoleFromToken(token);
        if ("ADMIN".equals(role)) {
            return customerRepository.findAll();
        } else {
            return new ArrayList<>();
        }
    }

    // Hämta en kund via ID
    public Optional<Customer> getCustomerById(String token, Long customerId) {
        String role = jwtTokenUtil.getRoleFromToken(token);
        if ("ADMIN".equals(role)) {
            return customerRepository.findById(customerId);
        } else {
            // Är sålänge 500 internal server error
            throw new RuntimeException("Not permitted by Authorization");
        }
    }

    public Customer findByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Ingen kund hittades med email: " + email));


    }

    // Hämta profil
    public CustomerProfileDTO getMyProfile(String email) {

        System.out.println(email);
        System.out.println("#######################################################");

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return new CustomerProfileDTO(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getPostalCode(),
                customer.getCity(),
                customer.getCountry()
        );
    }

    // Uppdatera profil
    public CustomerProfileDTO updateMyProfile(String token, CustomerProfileDTO dto) {

        String userEmail = jwtTokenUtil.getEmailFromToken(token);
        String role = jwtTokenUtil.getRoleFromToken(token);

        if (!role.equals("CUSTOMER")) {
            throw new RuntimeException("Forbidden: Only customers may update profile");
        }

        Customer customer = customerRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Update only allowed fields
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setPostalCode(dto.getPostalCode());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());

        customerRepository.save(customer);

        // Return updated data
        return getMyProfile(userEmail);
    }



    // Registrera ny kund
    public String registerCustomer(CustomerRegistrationDTO dto) {
        // Validering 1: Kolla att alla fält är ifyllda
        if (dto.getFirstName() == null || dto.getFirstName().isEmpty() ||
                dto.getLastName() == null || dto.getLastName().isEmpty() ||
                dto.getEmail() == null || dto.getEmail().isEmpty() ||
                dto.getPassword() == null || dto.getPassword().isEmpty() ||
                dto.getConfirmPassword() == null || dto.getConfirmPassword().isEmpty() ||
                dto.getAddress() == null || dto.getAddress().isEmpty() ||
                dto.getPostalCode() == null || dto.getPostalCode().isEmpty() ||
                dto.getCity() == null || dto.getCity().isEmpty() ||
                dto.getCountry() == null || dto.getCountry().isEmpty() ||
                dto.getPhone() == null || dto.getPhone().isEmpty()) {
            return "Alla fält måste fyllas i";
        }

        // Validering 2: Email-format (måste innehålla @)
        if (!dto.getEmail().contains("@")) {
            return "Ogiltig e-postadress";
        }

        // Validering 3: Kolla om email redan finns
        Optional<Customer> existingCustomer = customerRepository.findByEmail(dto.getEmail());
        if (existingCustomer.isPresent()) {
            return "E-post redan registrerad";
        }

        // Validering 4: Lösenord minst 8 tecken
        if (dto.getPassword().length() < 8) {
            return "Lösenord måste vara minst 8 tecken";
        }

        // Validering 5: Lösenorden måste matcha
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            return "Lösenorden matchar inte";
        }

        // Skapa ny Customer
        Customer newCustomer = new Customer();
        newCustomer.setFirstName(dto.getFirstName());
        newCustomer.setLastName(dto.getLastName());
        newCustomer.setEmail(dto.getEmail());

        newCustomer.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Hasha lösenordet med BCrypt
        //String hashedPassword = passwordEncoder.encode(dto.getPassword());
        //newCustomer.setPassword(hashedPassword);

        newCustomer.setAddress(dto.getAddress());
        newCustomer.setPostalCode(dto.getPostalCode());
        newCustomer.setCity(dto.getCity());
        newCustomer.setCountry(dto.getCountry());
        newCustomer.setPhone(dto.getPhone());
        newCustomer.setCreated_At(LocalDateTime.now());

        // Spara i databasen
        customerRepository.save(newCustomer);

        return "SUCCESS";
    }

        // Metod för att uppdatera kunduppgifter
        public Customer updateCustomer (Long userId, CustomerProfileDTO customerProfileDTO) {

            // 1. Hitta kunden genom Id
            Optional<Customer> optionalCustomer = customerRepository.findById(userId);

            if (optionalCustomer.isEmpty()) {
                    throw new RuntimeException("Kund med detta Id kan ej hittas");
                }

            Customer customer = optionalCustomer.get();

            //2. Validera input
            if (customerProfileDTO.getFirstName() == null || customerProfileDTO.getFirstName().isEmpty() ||
                    customerProfileDTO.getLastName() == null || customerProfileDTO.getLastName().isEmpty() ||
                    customerProfileDTO.getPhone() == null || customerProfileDTO.getPhone().isEmpty() ||
                    customerProfileDTO.getAddress() == null || customerProfileDTO.getAddress().isEmpty() ||
                    customerProfileDTO.getPostalCode() == null || customerProfileDTO.getPostalCode().isEmpty() ||
                    customerProfileDTO.getCity() == null || customer.getCity().isEmpty() ||
                    customerProfileDTO.getCountry() == null || customer.getCountry().isEmpty()) {

                throw new RuntimeException("Du måste ange alla uppgifter");
            }

            //3. Uppdatera fält
            customer.setFirstName(customerProfileDTO.getFirstName());
            customer.setLastName(customerProfileDTO.getLastName());
            customer.setPhone(customerProfileDTO.getPhone());
            customer.setAddress(customerProfileDTO.getAddress());
            customer.setPostalCode(customerProfileDTO.getPostalCode());
            customer.setCity(customerProfileDTO.getCity());
            customer.setCountry(customerProfileDTO.getCountry());

            //4. Spara uppgifter
            return customerRepository.save(customer);
        }









}