package com.saferide.service;

import com.saferide.exception.ResourceNotFoundException;
import com.saferide.model.DriverRegistry;
import com.saferide.model.User;
import com.saferide.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRegistryRepository driverRegistryRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private EmergencyEventRepository emergencyEventRepository;

    public DriverRegistry registerDriver(DriverRegistry driver) {
        return driverRegistryRepository.save(driver);
    }

    public void removeDriver(Long id) {
        if (!driverRegistryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Driver not found in registry with ID: " + id);
        }
        driverRegistryRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        user.setIsVerified(false); // Invalidate account verification as suspension
        return userRepository.save(user);
    }

    public User unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        user.setIsVerified(true);
        return userRepository.save(user);
    }

    public Map<String, Object> getAnalyticsStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDrivers", driverRegistryRepository.count());
        stats.put("totalComplaints", complaintRepository.count());
        stats.put("totalRides", rideRepository.count());
        stats.put("totalSosEvents", emergencyEventRepository.count());
        
        // Count active elements
        stats.put("activeRidesCount", rideRepository.findByStatus("ACTIVE").size());
        stats.put("activeSosCount", emergencyEventRepository.findByStatus("ACTIVE").size());
        
        return stats;
    }
}
