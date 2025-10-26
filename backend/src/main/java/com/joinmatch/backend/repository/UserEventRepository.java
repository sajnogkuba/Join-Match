package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.UserEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserEventRepository extends JpaRepository<UserEvent, Integer> {
    List<UserEvent> findByUserId(Integer id);

    List<UserEvent> findByEvent_EventId(Integer eventId);

}
