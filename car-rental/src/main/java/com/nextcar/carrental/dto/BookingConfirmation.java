package com.nextcar.carrental.dto;

import java.math.BigDecimal;

public class BookingConfirmation {
    private String bookingNumber;
    private String carBrand;
    private String carModel;
    private String customerName;
    private String startDate;
    private String endDate;
    private int totalDays;
    private BigDecimal totalPrice;

    // Getters och setters
    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }

    public String getCarBrand() { return carBrand; }
    public void setCarBrand(String carBrand) { this.carBrand = carBrand; }

    public String getCarModel() { return carModel; }
    public void setCarModel(String carModel) { this.carModel = carModel; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
