package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.EventVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventVisibilityRepository extends JpaRepository<EventVisibility, Integer> {
}
