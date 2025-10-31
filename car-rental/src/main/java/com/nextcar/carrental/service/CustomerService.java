package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Hämta alla kunder
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Hämta en kund via ID
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer findByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Ingen kund hittades med email: " + email));


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

        // Hasha lösenordet med BCrypt
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        newCustomer.setPassword(hashedPassword);

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
}