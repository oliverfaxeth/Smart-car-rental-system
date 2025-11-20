package com.nextcar.carrental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

public class CustomerBookingDTO {


    //Rentals

    private Long rentalId;

    private String rentalStatus;

    private LocalDate rentalStartDate;

    private LocalDate rentalEndDate;

    private LocalDate rentalDate;

    private String rentalBookingNumber;


    //Cars

    private String carBrand;

    private String carModel;

    private String carRegNr;

    private Integer carYear;

    private String carFuel;

    private String carTransmission;


    //Cars_Category

    private String carCategoryName;


    //Payments

    private BigDecimal paymentAmount;


    public CustomerBookingDTO() {
    }

    public CustomerBookingDTO(Long rentalId, String rentalStatus, LocalDate rentalStartDate, LocalDate rentalEndDate, LocalDate rentalDate, String rentalBookingNumber, String carBrand, String carModel, String carRegNr, Integer carYear, String carFuel, String carTransmission, String carCategoryName, BigDecimal paymentAmount) {
        this.rentalId = rentalId;
        this.rentalStatus = rentalStatus;
        this.rentalStartDate = rentalStartDate;
        this.rentalEndDate = rentalEndDate;
        this.rentalDate = rentalDate;
        this.rentalBookingNumber = rentalBookingNumber;
        this.carBrand = carBrand;
        this.carModel = carModel;
        this.carRegNr = carRegNr;
        this.carYear = carYear;
        this.carFuel = carFuel;
        this.carTransmission = carTransmission;
        this.carCategoryName = carCategoryName;
        this.paymentAmount = paymentAmount;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public String getRentalStatus() {
        return rentalStatus;
    }

    public void setRentalStatus(String rentalStatus) {
        this.rentalStatus = rentalStatus;
    }

    public LocalDate getRentalStartDate() {
        return rentalStartDate;
    }

    public void setRentalStartDate(LocalDate rentalStartDate) {
        this.rentalStartDate = rentalStartDate;
    }

    public LocalDate getRentalEndDate() {
        return rentalEndDate;
    }

    public void setRentalEndDate(LocalDate rentalEndDate) {
        this.rentalEndDate = rentalEndDate;
    }

    public LocalDate getRentalDate() {
        return rentalDate;
    }

    public void setRentalDate(LocalDate rentalDate) {
        this.rentalDate = rentalDate;
    }

    public String getRentalBookingNumber() {
        return rentalBookingNumber;
    }

    public void setRentalBookingNumber(String rentalBookingNumber) {
        this.rentalBookingNumber = rentalBookingNumber;
    }

    public String getCarBrand() {
        return carBrand;
    }

    public void setCarBrand(String carBrand) {
        this.carBrand = carBrand;
    }

    public String getCarModel() {
        return carModel;
    }

    public void setCarModel(String carModel) {
        this.carModel = carModel;
    }

    public String getCarRegNr() {
        return carRegNr;
    }

    public void setCarRegNr(String carRegNr) {
        this.carRegNr = carRegNr;
    }

    public Integer getCarYear() {
        return carYear;
    }

    public void setCarYear(Integer carYear) {
        this.carYear = carYear;
    }

    public String getCarFuel() {
        return carFuel;
    }

    public void setCarFuel(String carFuel) {
        this.carFuel = carFuel;
    }

    public String getCarTransmission() {
        return carTransmission;
    }

    public void setCarTransmission(String carTransmission) {
        this.carTransmission = carTransmission;
    }

    public String getCarCategoryName() {
        return carCategoryName;
    }

    public void setCarCategoryName(String carCategoryName) {
        this.carCategoryName = carCategoryName;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }
}