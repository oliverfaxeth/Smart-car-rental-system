package com.nextcar.carrental.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")  // Base path för alla admin-routes
public class AdminPageController {

    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "admin-dashboard.html";
    }

    @GetMapping("/cars")
    public String adminCars() {
        return "admin-cars.html";
    }

    @GetMapping("/customers")
    public String adminCustomers() {
        return "admin-customers.html";
    }

    @GetMapping("/bookings")
    public String adminBookings() {
        return "admin-bookings.html";
    }

    @GetMapping("/payments")
    public String adminPayments() {
        return "admin-payments.html";
    }
}