package com.nextcar.carrental.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Controller för att hantera clean URLs utan .html-ändelser
// Mappar /register -> register.html, /login -> login.html, etc.
@Controller
public class PageController {

    // Startsida - redan fungerar med Spring Boot default
    @GetMapping("/")
    public String home() {
        return "index.html";
    }

    // Registrering - /register istället för /register.html
    @GetMapping("/register")
    public String register() {
        return "register.html";
    }

    // Inloggning - /login istället för /login.html
    @GetMapping("/login")
    public String login() {
        return "login.html";
    }

    // Alla bilar - /cars istället för /all-cars.html
    @GetMapping("/all-cars")
    public String allCars() {
        return "all-cars.html";
    }

    // Om oss - /about istället för /about.html
    @GetMapping("/about")
    public String about() {
        return "about.html";
    }

    // Kontakt - /contact istället för /contact.html
    @GetMapping("/contact")
    public String contact() {
        return "contact.html";
    }

    // Användarprofil - /profile istället för /profile.html
    @GetMapping("/profile")
    public String profile() {
        return "profile.html";
    }

    // Mina bokningar - /my-bookings istället för /my-bookings.html
    @GetMapping("/my-bookings")
    public String myBookings() {
        return "my-bookings.html";
    }

    // ADMIN SIDOR
    // Admin dashboard - /admin/dashboard istället för /admin-dashboard.html
    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin-dashboard.html";
    }

    // Admin bilar - /admin/cars istället för /admin-cars.html
    @GetMapping("/admin/cars")
    public String adminCars() {
        return "admin-cars.html";
    }

    // Admin kunder - /admin/customers istället för /admin-customers.html
    @GetMapping("/admin/customers")
    public String adminCustomers() {
        return "admin-customers.html";
    }

    // Admin bokningar - /admin/bookings istället för /admin-bookings.html
    @GetMapping("/admin/bookings")
    public String adminBookings() {
        return "admin-bookings.html";
    }

    // Admin betalningar - /admin/payments istället för /admin-payments.html
    @GetMapping("/admin/payments")
    public String adminPayments() {
        return "admin-payments.html";
    }


}