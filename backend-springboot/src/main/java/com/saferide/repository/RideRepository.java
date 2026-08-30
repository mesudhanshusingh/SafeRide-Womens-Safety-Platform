package com.saferide.repository;

import com.saferide.model.Ride;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByUserId(Long userId);
    Optional<Ride> findFirstByUserIdAndStatusOrderByStartTimeDesc(Long userId, String status);
    List<Ride> findByStatus(String status);
}
