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

    @ManyToOne
    @JoinColumn(name = "categoryId", nullable = false)
    private CarsCategory category;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false, length = 20)
    private String regNr;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url") // För att kunna koppla databas image_url till frontend
    private String imageUrl;

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getFuel() { return fuel; }
    public void setFuel(String fuel) { this.fuel = fuel; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public CarsCategory getCategory() { return category; }
    public void setCategory(CarsCategory category) { this.category = category; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getRegNr() { return regNr; }
    public void setRegNr(String regNr) { this.regNr = regNr; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    // Hjälpmetod för att hämta categoryId direkt
    public Integer getCategoryId() {
        return category != null ? category.getId() : null;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
