package com.nextcar.carrental.service;

import com.nextcar.carrental.dto.CustomerRegistrationDTO;
import com.nextcar.carrental.dto.CustomerUpdateDTO;
import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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

        // Metod för att uppdatera kunduppgifter
        public Customer updateCustomer (Integer userId, CustomerUpdateDTO customerUpdateDTO) {

            // 1. Hitta kunden genom Id
            Optional<Customer> optionalCustomer = customerRepository.findById(Long.valueOf(userId));

            if (optionalCustomer.isEmpty()) {
                    throw new RuntimeException("Kund med detta Id kan ej hittas");
                }

            Customer customer = optionalCustomer.get();

            //2. Validera input
            if (customerUpdateDTO.getFirstName() == null || customerUpdateDTO.getFirstName().isEmpty() ||
                    customerUpdateDTO.getLastName() == null || customerUpdateDTO.getLastName().isEmpty() ||
                    customerUpdateDTO.getPhone() == null || customerUpdateDTO.getPhone().isEmpty() ||
                    customerUpdateDTO.getAddress() == null || customerUpdateDTO.getAddress().isEmpty() ||
                    customerUpdateDTO.getPostalCode() == null || customerUpdateDTO.getPostalCode().isEmpty() ||
                    customerUpdateDTO.getCity() == null || customer.getCity().isEmpty() ||
                    customerUpdateDTO.getCountry() == null || customer.getCountry().isEmpty()) {

                throw new RuntimeException("Du måste ange alla uppgifter");
            }

            //3. Uppdatera fält
            customer.setFirstName(customerUpdateDTO.getFirstName());
            customer.setLastName(customerUpdateDTO.getLastName());
            customer.setPhone(customerUpdateDTO.getPhone());
            customer.setAddress(customerUpdateDTO.getAddress());
            customer.setPostalCode(customerUpdateDTO.getPostalCode());
            customer.setCity(customerUpdateDTO.getCity());
            customer.setCountry(customerUpdateDTO.getCountry());

            //4. Spara uppgifter
            return customerRepository.save(customer);
        }









}