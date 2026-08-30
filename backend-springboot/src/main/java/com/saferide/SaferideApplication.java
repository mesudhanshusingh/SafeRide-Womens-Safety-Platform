package com.saferide;

import com.saferide.repository.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(
    basePackages = "com.saferide.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
        UserRepository.class,
        TrustedContactRepository.class,
        DriverRegistryRepository.class,
        ComplaintRepository.class
    })
)
@EnableMongoRepositories(
    basePackages = "com.saferide.repository",
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
        CommunityAlertRepository.class,
        EmergencyEventRepository.class,
        RideRepository.class
    })
)
public class SaferideApplication {

    public static void main(String[] args) {
        SpringApplication.run(SaferideApplication.class, args);
    }
}

