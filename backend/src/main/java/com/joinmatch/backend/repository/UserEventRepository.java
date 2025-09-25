package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.UserEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserEventRepository extends JpaRepository<UserEvent, Integer> {
}
