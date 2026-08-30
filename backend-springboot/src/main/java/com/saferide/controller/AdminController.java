package com.saferide.controller;

import com.saferide.model.DriverRegistry;
import com.saferide.model.User;
import com.saferide.model.Complaint;
import com.saferide.service.AdminService;
import com.saferide.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ComplaintService complaintService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getAnalyticsStatistics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/block/{userId}")
    public ResponseEntity<User> blockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.blockUser(userId));
    }

    @PostMapping("/users/unblock/{userId}")
    public ResponseEntity<User> unblockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.unblockUser(userId));
    }

    @PostMapping("/drivers")
    public ResponseEntity<DriverRegistry> registerDriver(@Validated @RequestBody DriverRegistry driver) {
        return ResponseEntity.ok(adminService.registerDriver(driver));
    }

    @DeleteMapping("/drivers/{driverId}")
    public ResponseEntity<Void> removeDriver(@PathVariable Long driverId) {
        adminService.removeDriver(driverId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/complaints/status/{complaintId}")
    public ResponseEntity<Complaint> updateComplaintStatus(
            @PathVariable Long complaintId,
            @RequestParam String status) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(complaintId, status));
    }
}
