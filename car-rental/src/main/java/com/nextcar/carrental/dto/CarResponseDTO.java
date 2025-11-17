package com.nextcar.carrental.dto;

import com.nextcar.carrental.entity.CarsCategory;

import java.math.BigDecimal;

public class CarResponseDTO {

    private String brand;

    private String model;

    private Integer year;

    private String fuel;

    private String transmission;

    private CarsCategory category;

    private Integer seats;

    private BigDecimal price;

    private String imageUrl;

    public CarResponseDTO() {
    }

    public CarResponseDTO(String brand, String model, Integer year, String fuel, String transmission, CarsCategory category, Integer seats, BigDecimal price, String imageUrl) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.fuel = fuel;
        this.transmission = transmission;
        this.category = category;
        this.seats = seats;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public String getBrand() {
        return brand;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getSeats() {
        return seats;
    }

    public CarsCategory getCategory() {
        return category;
    }

    public String getTransmission() {
        return transmission;
    }

    public Integer getYear() {
        return year;
    }

    public String getModel() {
        return model;
    }

    public String getFuel() {
        return fuel;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public void setFuel(String fuel) {
        this.fuel = fuel;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public void setCategory(CarsCategory category) {
        this.category = category;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
