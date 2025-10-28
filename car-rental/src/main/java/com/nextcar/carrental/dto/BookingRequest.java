package com.nextcar.carrental.dto;

import java.time.LocalDate;

public class BookingRequest {
    private Integer carId;
    private Integer customerId;
    private LocalDate startDate;
    private LocalDate endDate;

    // Getters och setters
    public Integer getCarId() { return carId; }
    public void setCarId(Integer carId) { this.carId = carId; }

    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}

