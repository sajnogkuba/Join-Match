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

}

