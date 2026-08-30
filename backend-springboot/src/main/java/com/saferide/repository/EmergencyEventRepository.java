package com.saferide.repository;

import com.saferide.model.EmergencyEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyEventRepository extends MongoRepository<EmergencyEvent, String> {
    List<EmergencyEvent> findByUserId(Long userId);
    List<EmergencyEvent> findByStatus(String status);
    List<EmergencyEvent> findAllByOrderByTimestampDesc();
}
