package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserEventRepository extends JpaRepository<UserEvent, Integer> {
    List<UserEvent> findByUserId(Integer id);

    List<UserEvent> findByEvent_EventId(Integer eventId);

    void deleteByUserAndEvent(User user, Event event);

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
    boolean existsByUserAndEvent(User user, Event event);

}
