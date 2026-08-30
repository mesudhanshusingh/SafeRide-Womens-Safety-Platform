package com.saferide.controller;

import com.saferide.exception.BadRequestException;
import com.saferide.model.EmergencyEvent;
import com.saferide.model.User;
import com.saferide.service.AuthService;
import com.saferide.service.SosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    @Autowired
    private SosService sosService;

    @Autowired
    private AuthService authService;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required!");
        }
        return authService.getProfile(principal.getName());
    }

    public static class SosTriggerRequest {
        private String rideId;
        private String triggerType; // ONE_CLICK_SOS, CHECKIN_TIMEOUT, PASSCODE_SOS, FAKE_DRIVER_SOS
        private Double latitude;
        private Double longitude;

        public SosTriggerRequest() {
        }

        public SosTriggerRequest(String rideId, String triggerType, Double latitude, Double longitude) {
            this.rideId = rideId;
            this.triggerType = triggerType;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public String getRideId() {
            return rideId;
        }

        public void setRideId(String rideId) {
            this.rideId = rideId;
        }

        public String getTriggerType() {
            return triggerType;
        }

        public void setTriggerType(String triggerType) {
            this.triggerType = triggerType;
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

    @PostMapping("/trigger")
    public ResponseEntity<EmergencyEvent> triggerSos(@RequestBody SosTriggerRequest req, Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(sosService.triggerSos(
                user.getId(),
                req.getRideId(),
                req.getTriggerType(),
                req.getLatitude(),
                req.getLongitude()
        ));
    }

    @PostMapping("/evidence/{eventId}")
    public ResponseEntity<EmergencyEvent> uploadEvidence(
            @PathVariable String eventId,
            @RequestParam String audioUrl,
            @RequestParam String videoUrl,
            @RequestParam Integer durationSec) {
        return ResponseEntity.ok(sosService.uploadEvidence(eventId, audioUrl, videoUrl, durationSec));
    }

    @PostMapping("/resolve/{eventId}")
    public ResponseEntity<EmergencyEvent> resolveSos(
            @PathVariable String eventId,
            @RequestParam String status) {
        if (!"RESOLVED".equals(status) && !"FALSE_ALARM".equals(status)) {
            throw new BadRequestException("Invalid resolution status: " + status);
        }
        return ResponseEntity.ok(sosService.resolveSos(eventId, status));
    }

    @GetMapping("/active")
    public ResponseEntity<List<EmergencyEvent>> getActiveSos() {
        return ResponseEntity.ok(sosService.getActiveEvents());
    }

    @GetMapping
    public ResponseEntity<List<EmergencyEvent>> getAllSos() {
        return ResponseEntity.ok(sosService.getAllEvents());
    }
}
