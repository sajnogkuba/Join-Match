package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.EventRating;
import org.springframework.data.jpa.repository.JpaRepository;
import com.joinmatch.backend.model.User;

import java.util.List;

public interface EventRatingRepository extends JpaRepository<EventRating, Integer> {
    List<EventRating> findByEvent_EventId(Integer eventId);
    List<EventRating> findByEvent(Event event);
    boolean existsByUserAndEvent(User user, Event event);
    List<EventRating> findAllByEvent_EventId(Integer eventId);

}