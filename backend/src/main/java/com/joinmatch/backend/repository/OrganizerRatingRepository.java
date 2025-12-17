package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.OrganizerRating;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrganizerRatingRepository extends JpaRepository<OrganizerRating, Integer> {

    List<OrganizerRating> findByOrganizer(User organizer);

    List<OrganizerRating> findByEvent(Event event);

    boolean existsByRaterAndEvent(User rater, Event event);

    @Query("SELECT AVG(o.rating) FROM OrganizerRating o WHERE o.organizer.id = :organizerId")
    Double getAverageOrganizerRating(Integer organizerId);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture, 
               COALESCE(AVG(orgRating.rating), 0.0) as avgRating,
               COUNT(orgRating.id) as totalRatings
        FROM User u
        LEFT JOIN OrganizerRating orgRating ON orgRating.organizer.id = u.id
        WHERE u.isBlocked = false AND u.isVerified = true
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(orgRating.id) >= :minRatings
        ORDER BY avgRating DESC, totalRatings DESC
        LIMIT :limit
    """)
    List<Object[]> findTopOrganizersByRating(@Param("limit") Integer limit, @Param("minRatings") Integer minRatings);
}
