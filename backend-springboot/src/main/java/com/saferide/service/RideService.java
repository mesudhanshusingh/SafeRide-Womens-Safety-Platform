package com.saferide.service;

import com.saferide.dto.RideDto.*;
import com.saferide.exception.BadRequestException;
import com.saferide.exception.ResourceNotFoundException;
import com.saferide.model.DriverRegistry;
import com.saferide.model.Ride;
import com.saferide.model.Ride.Destination;
import com.saferide.model.Ride.LocationPoint;
import com.saferide.model.Ride.CheckIn;
import com.saferide.repository.DriverRegistryRepository;
import com.saferide.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private DriverRegistryRepository driverRegistryRepository;

    public Ride startRide(Long userId, RideStartRequest req) {
        // Stop any active ride first if it exists
        Optional<Ride> activeRideOpt = rideRepository.findFirstByUserIdAndStatusOrderByStartTimeDesc(userId, "ACTIVE");
        if (activeRideOpt.isPresent()) {
            Ride activeRide = activeRideOpt.get();
            activeRide.setStatus("COMPLETED");
            activeRide.setEndTime(LocalDateTime.now());
            rideRepository.save(activeRide);
        }

        Ride ride = new Ride();
        ride.setUserId(userId);
        ride.setVehicleNumber(req.getVehicleNumber());
        ride.setVehicleType(req.getVehicleType());
        ride.setStatus("ACTIVE");
        ride.setStartTime(LocalDateTime.now());
        
        Destination dest = new Destination(req.getDestinationName(), req.getDestinationLat(), req.getDestinationLng());
        ride.setDestination(dest);
        
        // Initial dummy safety score (actual calculated dynamically by AI service)
        ride.setRouteSafetyScore(92.0);

        return rideRepository.save(ride);
    }

    public Ride endRide(String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
        
        ride.setStatus("COMPLETED");
        ride.setEndTime(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride updateLocation(String rideId, LocationUpdateRequest req) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
        
        if (!"ACTIVE".equals(ride.getStatus()) && !"SOS_TRIGGERED".equals(ride.getStatus())) {
            throw new BadRequestException("Cannot update location for a non-active ride!");
        }

        LocationPoint point = new LocationPoint(req.getLatitude(), req.getLongitude(), LocalDateTime.now());
        ride.getLocationHistory().add(point);
        return rideRepository.save(ride);
    }

    public Ride addCheckIn(String rideId, String status, String message) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
        
        CheckIn checkIn = new CheckIn(LocalDateTime.now(), status, message);
        ride.getCheckIns().add(checkIn);
        
        if ("TIMEOUT".equals(status)) {
            ride.setStatus("SOS_TRIGGERED");
        }
        
        return rideRepository.save(ride);
    }

    public Ride getActiveRide(Long userId) {
        return rideRepository.findFirstByUserIdAndStatusOrderByStartTimeDesc(userId, "ACTIVE")
                .orElse(null);
    }

    public DriverRegistry verifyDriver(String vehicleNumber) {
        return driverRegistryRepository.findByVehicleNumber(vehicleNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No registry record found for vehicle: " + vehicleNumber));
    }
    
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }
}
