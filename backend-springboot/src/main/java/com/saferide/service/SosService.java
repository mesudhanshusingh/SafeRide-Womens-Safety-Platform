package com.saferide.service;

import com.saferide.exception.ResourceNotFoundException;
import com.saferide.model.EmergencyEvent;
import com.saferide.model.EmergencyEvent.GpsLocation;
import com.saferide.model.EmergencyEvent.Evidence;
import com.saferide.model.EmergencyEvent.NotificationLog;
import com.saferide.model.TrustedContact;
import com.saferide.model.Ride;
import com.saferide.repository.EmergencyEventRepository;
import com.saferide.repository.TrustedContactRepository;
import com.saferide.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SosService {

    @Autowired
    private EmergencyEventRepository emergencyEventRepository;

    @Autowired
    private TrustedContactRepository trustedContactRepository;

    @Autowired
    private RideRepository rideRepository;

    public EmergencyEvent triggerSos(Long userId, String rideId, String triggerType, Double lat, Double lng) {
        // Create emergency event
        EmergencyEvent event = new EmergencyEvent();
        event.setUserId(userId);
        event.setRideId(rideId);
        event.setTimestamp(LocalDateTime.now());
        event.setStatus("ACTIVE");
        event.setTriggerType(triggerType);
        event.setGpsLocation(new GpsLocation(lat, lng));

        // Update ride status to SOS_TRIGGERED if rideId is provided
        if (rideId != null && !rideId.isEmpty()) {
            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            if (rideOpt.isPresent()) {
                Ride ride = rideOpt.get();
                ride.setStatus("SOS_TRIGGERED");
                rideRepository.save(ride);
            }
        }

        // Fetch trusted contacts to notify
        List<TrustedContact> contacts = trustedContactRepository.findByUserId(userId);
        for (TrustedContact contact : contacts) {
            NotificationLog smsLog = new NotificationLog(
                    "SMS",
                    contact.getContactPhone(),
                    "SENT",
                    LocalDateTime.now()
            );
            event.getNotificationsSent().add(smsLog);

            NotificationLog emailLog = new NotificationLog(
                    "EMAIL",
                    contact.getContactEmail(),
                    "SENT",
                    LocalDateTime.now()
            );
            event.getNotificationsSent().add(emailLog);
        }

        // Log police notification
        NotificationLog policeLog = new NotificationLog(
                "POLICE_ALERT",
                "Nearest Police Control Room (GPS Dispatch)",
                "SENT",
                LocalDateTime.now()
        );
        event.getNotificationsSent().add(policeLog);

        return emergencyEventRepository.save(event);
    }

    public EmergencyEvent uploadEvidence(String eventId, String audioUrl, String videoUrl, Integer duration) {
        EmergencyEvent event = emergencyEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency event not found with ID: " + eventId));
        
        event.setEvidence(new Evidence(audioUrl, videoUrl, duration));
        return emergencyEventRepository.save(event);
    }

    public EmergencyEvent resolveSos(String eventId, String resolutionStatus) {
        EmergencyEvent event = emergencyEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency event not found with ID: " + eventId));
        
        event.setStatus(resolutionStatus); // RESOLVED, FALSE_ALARM
        event.setResolvedAt(LocalDateTime.now());
        
        // Resolve associated ride if active
        if (event.getRideId() != null) {
            Optional<Ride> rideOpt = rideRepository.findById(event.getRideId());
            if (rideOpt.isPresent() && "SOS_TRIGGERED".equals(rideOpt.get().getStatus())) {
                Ride ride = rideOpt.get();
                ride.setStatus("COMPLETED");
                ride.setEndTime(LocalDateTime.now());
                rideRepository.save(ride);
            }
        }
        
        return emergencyEventRepository.save(event);
    }

    public List<EmergencyEvent> getActiveEvents() {
        return emergencyEventRepository.findByStatus("ACTIVE");
    }

    public List<EmergencyEvent> getAllEvents() {
        return emergencyEventRepository.findAllByOrderByTimestampDesc();
    }
}
