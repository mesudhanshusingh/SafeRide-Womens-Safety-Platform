package com.saferide.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rides")
public class Ride {

    @Id
    private String id;
    
    private Long userId;
    private String vehicleNumber;
    private String vehicleType; // CAB, AUTO, BUS, WALKING
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, SUSPENDED, SOS_TRIGGERED
    private LocalDateTime startTime = LocalDateTime.now();
    private LocalDateTime endTime;
    
    private Destination destination;
    private Double routeSafetyScore;
    
    private List<CheckIn> checkIns = new ArrayList<>();
    private List<LocationPoint> locationHistory = new ArrayList<>();

    public Ride() {
    }

    public Ride(String id, Long userId, String vehicleNumber, String vehicleType, String status, LocalDateTime startTime, LocalDateTime endTime, Destination destination, Double routeSafetyScore, List<CheckIn> checkIns, List<LocationPoint> locationHistory) {
        this.id = id;
        this.userId = userId;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.destination = destination;
        this.routeSafetyScore = routeSafetyScore;
        this.checkIns = checkIns;
        this.locationHistory = locationHistory;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Destination getDestination() {
        return destination;
    }

    public void setDestination(Destination destination) {
        this.destination = destination;
    }

    public Double getRouteSafetyScore() {
        return routeSafetyScore;
    }

    public void setRouteSafetyScore(Double routeSafetyScore) {
        this.routeSafetyScore = routeSafetyScore;
    }

    public List<CheckIn> getCheckIns() {
        return checkIns;
    }

    public void setCheckIns(List<CheckIn> checkIns) {
        this.checkIns = checkIns;
    }

    public List<LocationPoint> getLocationHistory() {
        return locationHistory;
    }

    public void setLocationHistory(List<LocationPoint> locationHistory) {
        this.locationHistory = locationHistory;
    }

    public static class Destination {
        private String name;
        private Double lat;
        private Double lng;

        public Destination() {
        }

        public Destination(String name, Double lat, Double lng) {
            this.name = name;
            this.lat = lat;
            this.lng = lng;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getLat() {
            return lat;
        }

        public void setLat(Double lat) {
            this.lat = lat;
        }

        public Double getLng() {
            return lng;
        }

        public void setLng(Double lng) {
            this.lng = lng;
        }
    }

    public static class CheckIn {
        private LocalDateTime timestamp = LocalDateTime.now();
        private String status; // RESPONDED, TIMEOUT, IGNORED
        private String message;

        public CheckIn() {
        }

        public CheckIn(LocalDateTime timestamp, String status, String message) {
            this.timestamp = timestamp;
            this.status = status;
            this.message = message;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class LocationPoint {
        private Double lat;
        private Double lng;
        private LocalDateTime timestamp = LocalDateTime.now();

        public LocationPoint() {
        }

        public LocationPoint(Double lat, Double lng, LocalDateTime timestamp) {
            this.lat = lat;
            this.lng = lng;
            this.timestamp = timestamp;
        }

        public Double getLat() {
            return lat;
        }

        public void setLat(Double lat) {
            this.lat = lat;
        }

        public Double getLng() {
            return lng;
        }

        public void setLng(Double lng) {
            this.lng = lng;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
