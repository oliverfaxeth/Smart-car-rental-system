package com.nextcar.carrental.controller;

import com.nextcar.carrental.entity.Customer;
import com.nextcar.carrental.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
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
}
