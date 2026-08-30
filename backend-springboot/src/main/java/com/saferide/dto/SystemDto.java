package com.saferide.dto;

public class SystemDto {

    public static class TrustedContactRequest {
        private String contactName;
        private String contactPhone;
        private String contactEmail;
        private String relationship;

        public TrustedContactRequest() {
        }

        public TrustedContactRequest(String contactName, String contactPhone, String contactEmail, String relationship) {
            this.contactName = contactName;
            this.contactPhone = contactPhone;
            this.contactEmail = contactEmail;
            this.relationship = relationship;
        }

        public String getContactName() {
            return contactName;
        }

        public void setContactName(String contactName) {
            this.contactName = contactName;
        }

        public String getContactPhone() {
            return contactPhone;
        }

        public void setContactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public void setContactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
        }

        public String getRelationship() {
            return relationship;
        }

        public void setRelationship(String relationship) {
            this.relationship = relationship;
        }
    }

    public static class ComplaintRequest {
        private String vehicleNumber;
        private String driverName;
        private String incidentDate; // ISO String format
        private String incidentType;
        private String description;
        private String evidenceUrl;

        public ComplaintRequest() {
        }

        public ComplaintRequest(String vehicleNumber, String driverName, String incidentDate, String incidentType, String description, String evidenceUrl) {
            this.vehicleNumber = vehicleNumber;
            this.driverName = driverName;
            this.incidentDate = incidentDate;
            this.incidentType = incidentType;
            this.description = description;
            this.evidenceUrl = evidenceUrl;
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

        public String getIncidentDate() {
            return incidentDate;
        }

        public void setIncidentDate(String incidentDate) {
            this.incidentDate = incidentDate;
        }

        public String getIncidentType() {
            return incidentType;
        }

        public void setIncidentType(String incidentType) {
            this.incidentType = incidentType;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getEvidenceUrl() {
            return evidenceUrl;
        }

        public void setEvidenceUrl(String evidenceUrl) {
            this.evidenceUrl = evidenceUrl;
        }
    }

    public static class AlertRequest {
        private String title;
        private String description;
        private String category;
        private Double latitude;
        private Double longitude;
        private Boolean isAnonymous;

        public AlertRequest() {
        }

        public AlertRequest(String title, String description, String category, Double latitude, Double longitude, Boolean isAnonymous) {
            this.title = title;
            this.description = description;
            this.category = category;
            this.latitude = latitude;
            this.longitude = longitude;
            this.isAnonymous = isAnonymous;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
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

        public Boolean getIsAnonymous() {
            return isAnonymous;
        }

        public void setIsAnonymous(Boolean isAnonymous) {
            this.isAnonymous = isAnonymous;
        }
    }
}
