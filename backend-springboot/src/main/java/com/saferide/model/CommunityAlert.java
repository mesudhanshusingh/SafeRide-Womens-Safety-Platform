package com.saferide.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "community_alerts")
public class CommunityAlert {

    @Id
    private String id;
    
    private String title;
    private String description;
    private String category; // HARASSMENT, UNSAFE_AREA, SUSPICIOUS_ACTIVITY, BAD_LIGHTING
    
    private Double latitude;
    private Double longitude;
    
    private Boolean isAnonymous = true;
    private Integer upvotes = 0;
    private LocalDateTime timestamp = LocalDateTime.now();

    public CommunityAlert() {
    }

    public CommunityAlert(String id, String title, String description, String category, Double latitude, Double longitude, Boolean isAnonymous, Integer upvotes, LocalDateTime timestamp) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isAnonymous = isAnonymous;
        this.upvotes = upvotes;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Integer getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
