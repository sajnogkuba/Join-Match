package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.EventRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRatingRepository extends JpaRepository<EventRating, Integer> {
    List<EventRating> findByEvent_EventId(Integer eventId);
}