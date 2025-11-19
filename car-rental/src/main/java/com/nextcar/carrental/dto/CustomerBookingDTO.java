package com.nextcar.carrental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

public class CustomerBookingDTO {

    //Cars

    private String brand;

    private String model;

    private String regNr;

    private String year;

    private String fuel;

    private String transmission;

    //Rentals

    private Long id;

    private String status;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate rentalDate;

    private String bookingNumber;

    //Payments

    private BigDecimal amount;

    //Cars_Category

    private String name;


    public CustomerBookingDTO() {
    }

    public CustomerBookingDTO(String brand, String model, String regNr, String year, String fuel, String transmission, Long id, String status, LocalDate startDate, LocalDate endDate, LocalDate rentalDate, String bookingNumber, BigDecimal amount, String name) {
        this.brand = brand;
        this.model = model;
        this.regNr = regNr;
        this.year = year;
        this.fuel = fuel;
        this.transmission = transmission;
        this.id = id;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.rentalDate = rentalDate;
        this.bookingNumber = bookingNumber;
        this.amount = amount;
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getRegNr() {
        return regNr;
    }

    public void setRegNr(String regNr) {
        this.regNr = regNr;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getFuel() {
        return fuel;
    }

    public void setFuel(String fuel) {
        this.fuel = fuel;
    }

    public String getTransmission() {
        return transmission;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getRentalDate() {
        return rentalDate;
    }

    public void setRentalDate(LocalDate rentalDate) {
        this.rentalDate = rentalDate;
    }

    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
