package com.saferide.repository;

import com.saferide.model.DriverRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DriverRegistryRepository extends JpaRepository<DriverRegistry, Long> {
    Optional<DriverRegistry> findByVehicleNumber(String vehicleNumber);
}
