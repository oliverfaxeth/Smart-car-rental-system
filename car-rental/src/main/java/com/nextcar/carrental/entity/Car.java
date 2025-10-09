package com.nextcar.carrental.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 20)
    private String fuel;

    @Column(nullable = false, length = 20)
    private String transmission;

    @Column(nullable = false)
    private Integer categoryId;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false, length = 20)
    private String regNr;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Constructors
    public Car() {
    }

    public Car(Integer id, String brand, String model, Integer year, String fuel,
               String transmission, Integer categoryId, Integer seats, String regNr, BigDecimal price) {
        this.id = id;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.fuel = fuel;
        this.transmission = transmission;
        this.categoryId = categoryId;
        this.seats = seats;
        this.regNr = regNr;
        this.price = price;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
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

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public String getRegNr() {
        return regNr;
    }

    public void setRegNr(String regNr) {
        this.regNr = regNr;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    // toString method
    @Override
    public String toString() {
        return "Car{" +
                "id=" + id +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", year=" + year +
                ", fuel='" + fuel + '\'' +
                ", transmission='" + transmission + '\'' +
                ", categoryId=" + categoryId +
                ", seats=" + seats +
                ", regNr='" + regNr + '\'' +
                ", price=" + price +
                '}';
    }
}