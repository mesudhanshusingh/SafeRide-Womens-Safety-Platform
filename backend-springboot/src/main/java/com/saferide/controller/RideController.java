package com.saferide.controller;

import com.saferide.dto.RideDto.*;
import com.saferide.exception.BadRequestException;
import com.saferide.model.DriverRegistry;
import com.saferide.model.Ride;
import com.saferide.model.User;
import com.saferide.service.AuthService;
import com.saferide.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private AuthService authService;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required!");
        }
        return authService.getProfile(principal.getName());
    }

    @PostMapping("/start")
    public ResponseEntity<Ride> startRide(@Validated @RequestBody RideStartRequest req, Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(rideService.startRide(user.getId(), req));
    }

    @PostMapping("/end/{rideId}")
    public ResponseEntity<Ride> endRide(@PathVariable String rideId) {
        return ResponseEntity.ok(rideService.endRide(rideId));
    }

    @PostMapping("/location/{rideId}")
    public ResponseEntity<Ride> updateLocation(@PathVariable String rideId, @Validated @RequestBody LocationUpdateRequest req) {
        return ResponseEntity.ok(rideService.updateLocation(rideId, req));
    }

    @PostMapping("/checkin/{rideId}")
    public ResponseEntity<Ride> addCheckIn(
            @PathVariable String rideId,
            @RequestParam String status,
            @RequestParam String message) {
        return ResponseEntity.ok(rideService.addCheckIn(rideId, status, message));
    }

    @GetMapping("/active")
    public ResponseEntity<Ride> getActiveRide(Principal principal) {
        User user = getAuthenticatedUser(principal);
        Ride activeRide = rideService.getActiveRide(user.getId());
        if (activeRide == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activeRide);
    }

    @GetMapping("/verify-driver")
    public ResponseEntity<DriverRegistry> verifyDriver(@RequestParam String vehicleNumber) {
        return ResponseEntity.ok(rideService.verifyDriver(vehicleNumber));
    }

    @GetMapping
    public ResponseEntity<List<Ride>> getAllRides() {
        return ResponseEntity.ok(rideService.getAllRides());
    }
}
