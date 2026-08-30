package com.saferide.controller;

import com.saferide.dto.SystemDto.AlertRequest;
import com.saferide.exception.ResourceNotFoundException;
import com.saferide.model.CommunityAlert;
import com.saferide.repository.CommunityAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private CommunityAlertRepository alertRepository;

    @PostMapping
    public ResponseEntity<CommunityAlert> createAlert(@Validated @RequestBody AlertRequest req) {
        CommunityAlert alert = new CommunityAlert();
        alert.setTitle(req.getTitle());
        alert.setDescription(req.getDescription());
        alert.setCategory(req.getCategory());
        alert.setLatitude(req.getLatitude());
        alert.setLongitude(req.getLongitude());
        alert.setIsAnonymous(req.getIsAnonymous() != null ? req.getIsAnonymous() : true);
        alert.setUpvotes(0);
        alert.setTimestamp(LocalDateTime.now());
        
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @GetMapping
    public ResponseEntity<List<CommunityAlert>> getAlerts() {
        return ResponseEntity.ok(alertRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/upvote/{alertId}")
    public ResponseEntity<CommunityAlert> upvoteAlert(@PathVariable String alertId) {
        CommunityAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));
        
        alert.setUpvotes(alert.getUpvotes() + 1);
        return ResponseEntity.ok(alertRepository.save(alert));
    }
}
