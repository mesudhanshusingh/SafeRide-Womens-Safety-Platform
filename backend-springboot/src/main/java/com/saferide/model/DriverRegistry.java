package com.saferide.model;

import jakarta.persistence.*;

@Entity
@Table(name = "drivers_registry")
public class DriverRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_number", nullable = false, unique = true, length = 20)
    private String vehicleNumber;

    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;

    @Column(nullable = false)
    private Double rating = 5.0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public DriverRegistry() {
    }

    public DriverRegistry(Long id, String vehicleNumber, String driverName, String phone, String licenseNumber, String vehicleModel, Double rating, Boolean isActive) {
        this.id = id;
        this.vehicleNumber = vehicleNumber;
        this.driverName = driverName;
        this.phone = phone;
        this.licenseNumber = licenseNumber;
        this.vehicleModel = vehicleModel;
        this.rating = rating;
        this.isActive = isActive;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
