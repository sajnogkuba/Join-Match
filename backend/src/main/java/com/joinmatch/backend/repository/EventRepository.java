package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EventRepository extends JpaRepository<Event, Long> {
public interface EventRepository extends JpaRepository<Event, Integer> {
    @Query("SELECT MAX(e.eventId) + 1 FROM Event e")
    Long getNextId();
}
