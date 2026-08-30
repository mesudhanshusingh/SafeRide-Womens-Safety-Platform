package com.saferide.service;

import com.saferide.dto.SystemDto.ComplaintRequest;
import com.saferide.exception.ResourceNotFoundException;
import com.saferide.model.Complaint;
import com.saferide.model.User;
import com.saferide.repository.ComplaintRepository;
import com.saferide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    public Complaint fileComplaint(Long userId, ComplaintRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setVehicleNumber(req.getVehicleNumber());
        complaint.setDriverName(req.getDriverName());
        
        try {
            complaint.setIncidentDate(LocalDateTime.parse(req.getIncidentDate(), DateTimeFormatter.ISO_DATE_TIME));
        } catch (Exception e) {
            complaint.setIncidentDate(LocalDateTime.now());
        }
        
        complaint.setIncidentType(req.getIncidentType());
        complaint.setDescription(req.getDescription());
        complaint.setEvidenceUrl(req.getEvidenceUrl());
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getUserComplaints(Long userId) {
        return complaintRepository.findByUserId(userId);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Complaint updateComplaintStatus(Long complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        
        complaint.setStatus(status); // INVESTIGATING, RESOLVED, DISMISSED
        return complaintRepository.save(complaint);
    }
}
