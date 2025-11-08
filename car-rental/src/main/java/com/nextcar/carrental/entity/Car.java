package com.nextcar.carrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Märke är obligatoriskt")
    @Size(min = 2, max = 50, message = "Märke måste vara mellan 2-50 tecken")
    @Column(nullable = false, length = 50)
    private String brand;

    @NotBlank(message = "Modell är obligatorisk")
    @Size(min = 1, max = 50, message = "Modell måste vara mellan 1-50 tecken")
    @Column(nullable = false, length = 50)
    private String model;

    @NotNull(message = "Årsmodell är obligatorisk")
    @Min(value = 2015, message = "Årsmodell måste vara från 2015 eller senare")
    @Max(value = 2030, message = "Årsmodell kan inte vara senare än 2030")
    @Column(nullable = false)
    private Integer year;

    @NotBlank(message = "Bränsletyp är obligatorisk")
    @Pattern(regexp = "^(Bensin|Diesel|Hybrid|Eldrivna)$",
            message = "Bränsletyp måste vara: Bensin, Diesel, Hybrid eller Eldrivna")
    @Column(nullable = false, length = 20)
    private String fuel;

    @NotBlank(message = "Växellåda är obligatorisk")
    @Pattern(regexp = "^(Manuell|Automat)$",
            message = "Växellåda måste vara: Manuell eller Automat")
    @Column(nullable = false, length = 20)
    private String transmission;

    @NotNull(message = "Kategori är obligatorisk")
    @ManyToOne
    @JoinColumn(name = "categoryId", nullable = false)
    private CarsCategory category;

    @NotNull(message = "Antal säten är obligatoriskt")
    @Min(value = 2, message = "Bilen måste ha minst 2 säten")
    @Max(value = 9, message = "Bilen kan ha max 9 säten")
    @Column(nullable = false)
    private Integer seats;

    @NotBlank(message = "Registreringsnummer är obligatoriskt")
    @Size(min = 3, max = 20, message = "Registreringsnummer måste vara mellan 3-20 tecken")
    @Pattern(regexp = "^[A-Za-z0-9]+$",
            message = "Registreringsnummer får bara innehålla bokstäver och siffror")
    @Column(nullable = false, length = 20)
    private String regNr;

    @NotNull(message = "Pris per dag är obligatoriskt")
    @DecimalMin(value = "0.01", message = "Pris måste vara större än 0")
    @DecimalMax(value = "9999.99", message = "Pris kan inte vara över 9999.99 kr")
    @Digits(integer = 4, fraction = 2, message = "Pris kan ha max 4 siffror före och 2 efter decimaltecknet")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // imageUrl är INTE obligatorisk enligt acceptanskriterierna (NICE TO HAVE)
    @Size(max = 255, message = "Bild-URL kan vara max 255 tecken")
    @Column(name = "image_url") // För att kunna koppla databas image_url till frontend
    private String imageUrl;

    // Status för nya bilar - automatiskt satt till ACTIVE enligt acceptanskriterier
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}