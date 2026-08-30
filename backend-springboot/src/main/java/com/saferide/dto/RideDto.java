package com.saferide.dto;

public class RideDto {

    public static class RideStartRequest {
        private String vehicleNumber;
        private String vehicleType; // CAB, AUTO, BUS, WALKING
        private String destinationName;
        private Double destinationLat;
        private Double destinationLng;

        public RideStartRequest() {
        }

        public RideStartRequest(String vehicleNumber, String vehicleType, String destinationName, Double destinationLat, Double destinationLng) {
            this.vehicleNumber = vehicleNumber;
            this.vehicleType = vehicleType;
            this.destinationName = destinationName;
            this.destinationLat = destinationLat;
            this.destinationLng = destinationLng;
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

        public String getDestinationName() {
            return destinationName;
        }

        public void setDestinationName(String destinationName) {
            this.destinationName = destinationName;
        }

        public Double getDestinationLat() {
            return destinationLat;
        }

        public void setDestinationLat(Double destinationLat) {
            this.destinationLat = destinationLat;
        }

        public Double getDestinationLng() {
            return destinationLng;
        }

        public void setDestinationLng(Double destinationLng) {
            this.destinationLng = destinationLng;
        }
    }

    public static class LocationUpdateRequest {
        private Double latitude;
        private Double longitude;

        public LocationUpdateRequest() {
        }

        public LocationUpdateRequest(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }
}
