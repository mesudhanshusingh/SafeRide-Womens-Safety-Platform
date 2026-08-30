package com.saferide.repository;

import com.saferide.model.TrustedContact;
import com.saferide.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrustedContactRepository extends JpaRepository<TrustedContact, Long> {
    List<TrustedContact> findByUser(User user);
    List<TrustedContact> findByUserId(Long userId);
}
