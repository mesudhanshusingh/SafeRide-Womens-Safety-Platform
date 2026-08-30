package com.saferide.controller;

import com.saferide.dto.SystemDto.ComplaintRequest;
import com.saferide.exception.BadRequestException;
import com.saferide.model.Complaint;
import com.saferide.model.User;
import com.saferide.service.AuthService;
import com.saferide.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private AuthService authService;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required!");
        }
        return authService.getProfile(principal.getName());
    }

    @PostMapping
    public ResponseEntity<Complaint> fileComplaint(@Validated @RequestBody ComplaintRequest req, Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(complaintService.fileComplaint(user.getId(), req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(complaintService.getUserComplaints(user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }
}
