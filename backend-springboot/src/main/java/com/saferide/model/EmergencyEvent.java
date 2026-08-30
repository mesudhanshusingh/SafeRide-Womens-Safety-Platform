package com.saferide.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "emergency_events")
public class EmergencyEvent {

    @Id
    private String id;
    
    private Long userId;
    private String rideId;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status = "ACTIVE"; // ACTIVE, RESOLVED, FALSE_ALARM
    private LocalDateTime resolvedAt;
    
    private String triggerType; // ONE_CLICK_SOS, CHECKIN_TIMEOUT, PASSCODE_SOS, FAKE_DRIVER_SOS
    private GpsLocation gpsLocation;
    
    private Evidence evidence;
    private List<NotificationLog> notificationsSent = new ArrayList<>();

    public EmergencyEvent() {
    }

    public EmergencyEvent(String id, Long userId, String rideId, LocalDateTime timestamp, String status, LocalDateTime resolvedAt, String triggerType, GpsLocation gpsLocation, Evidence evidence, List<NotificationLog> notificationsSent) {
        this.id = id;
        this.userId = userId;
        this.rideId = rideId;
        this.timestamp = timestamp;
        this.status = status;
        this.resolvedAt = resolvedAt;
        this.triggerType = triggerType;
        this.gpsLocation = gpsLocation;
        this.evidence = evidence;
        this.notificationsSent = notificationsSent;
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

    public String getRideId() {
        return rideId;
    }

    public void setRideId(String rideId) {
        this.rideId = rideId;
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

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public GpsLocation getGpsLocation() {
        return gpsLocation;
    }

    public void setGpsLocation(GpsLocation gpsLocation) {
        this.gpsLocation = gpsLocation;
    }

    public Evidence getEvidence() {
        return evidence;
    }

    public void setEvidence(Evidence evidence) {
        this.evidence = evidence;
    }

    public List<NotificationLog> getNotificationsSent() {
        return notificationsSent;
    }

    public void setNotificationsSent(List<NotificationLog> notificationsSent) {
        this.notificationsSent = notificationsSent;
    }

    public static class GpsLocation {
        private Double lat;
        private Double lng;

        public GpsLocation() {
        }

        public GpsLocation(Double lat, Double lng) {
            this.lat = lat;
            this.lng = lng;
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

    public static class Evidence {
        private String audioUrl;
        private String videoUrl;
        private Integer recordingDurationSec;

        public Evidence() {
        }

        public Evidence(String audioUrl, String videoUrl, Integer recordingDurationSec) {
            this.audioUrl = audioUrl;
            this.videoUrl = videoUrl;
            this.recordingDurationSec = recordingDurationSec;
        }

        public String getAudioUrl() {
            return audioUrl;
        }

        public void setAudioUrl(String audioUrl) {
            this.audioUrl = audioUrl;
        }

        public String getVideoUrl() {
            return videoUrl;
        }

        public void setVideoUrl(String videoUrl) {
            this.videoUrl = videoUrl;
        }

        public Integer getRecordingDurationSec() {
            return recordingDurationSec;
        }

        public void setRecordingDurationSec(Integer recordingDurationSec) {
            this.recordingDurationSec = recordingDurationSec;
        }
    }

    public static class NotificationLog {
        private String type; // SMS, EMAIL, POLICE_ALERT
        private String recipient;
        private String status; // SENT, FAILED
        private LocalDateTime sentTime = LocalDateTime.now();

        public NotificationLog() {
        }

        public NotificationLog(String type, String recipient, String status, LocalDateTime sentTime) {
            this.type = type;
            this.recipient = recipient;
            this.status = status;
            this.sentTime = sentTime;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getRecipient() {
            return recipient;
        }

        public void setRecipient(String recipient) {
            this.recipient = recipient;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getSentTime() {
            return sentTime;
        }

        public void setSentTime(LocalDateTime sentTime) {
            this.sentTime = sentTime;
        }
    }
}
