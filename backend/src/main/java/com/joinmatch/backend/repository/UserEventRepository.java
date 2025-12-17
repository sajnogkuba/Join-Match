package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserEventRepository extends JpaRepository<UserEvent, Integer> {

    Page<UserEvent> findByUserId(Integer id, Pageable sortedPageable);

    List<UserEvent> findByEvent_EventId(Integer eventId);

    void deleteByUserAndEvent(User user, Event event);

    boolean existsByUserAndEvent(User user, Event event);

    Optional<UserEvent> findByEvent_EventIdAndUser_Id(Integer eventId, Integer userId);

    @Query("""
        SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END
        FROM Event e
        JOIN UserEvent ueRater ON ueRater.event = e
        JOIN UserEvent ueRated ON ueRated.event = e
        WHERE ueRater.user.id = :raterId
          AND (ueRated.user.id = :ratedId OR e.owner.id = :ratedId)
    """)
    boolean haveCommonEventOrOrganizer(@Param("raterId") Integer raterId,
                                       @Param("ratedId") Integer ratedId);

    @Query("SELECT COUNT(ue) FROM UserEvent ue WHERE ue.user.id = :userId")
    int countJoinedEvents(@Param("userId") Integer userId);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture, 
               COUNT(ue.id) as eventCount
        FROM User u
        LEFT JOIN UserEvent ue ON ue.user.id = u.id
        WHERE u.isBlocked = false AND u.isVerified = true
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(ue.id) > 0
        ORDER BY eventCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopUsersByActivity(@Param("limit") Integer limit);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture, 
               COUNT(ue.id) as eventCount
        FROM User u
        JOIN UserEvent ue ON ue.user.id = u.id
        JOIN Event e ON ue.event.eventId = e.eventId
        JOIN SportObject so ON e.sportObject.objectId = so.objectId
        WHERE u.isBlocked = false 
          AND u.isVerified = true
          AND LOWER(so.city) = LOWER(:city)
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(ue.id) > 0
        ORDER BY eventCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopUsersByLocalActivity(@Param("city") String city, @Param("limit") Integer limit);

}

