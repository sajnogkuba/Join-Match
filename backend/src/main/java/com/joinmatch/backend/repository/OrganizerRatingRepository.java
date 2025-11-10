package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.OrganizerRating;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrganizerRatingRepository extends JpaRepository<OrganizerRating, Integer> {

    List<OrganizerRating> findByOrganizer(User organizer);

    List<OrganizerRating> findByEvent(Event event);

    boolean existsByRaterAndEvent(User rater, Event event);

    @Query("SELECT AVG(o.rating) FROM OrganizerRating o WHERE o.organizer.id = :organizerId")
    Double getAverageOrganizerRating(Integer organizerId);
}
