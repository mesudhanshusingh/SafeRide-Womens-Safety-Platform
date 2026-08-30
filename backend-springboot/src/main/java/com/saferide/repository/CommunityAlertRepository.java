package com.saferide.repository;

import com.saferide.model.CommunityAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityAlertRepository extends MongoRepository<CommunityAlert, String> {
    List<CommunityAlert> findAllByOrderByTimestampDesc();
}
