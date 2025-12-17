package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {
    @Query("""
        select distinct e
        from Event e
        join JoinMatchToken t
          on t.user = e.owner
        where t.token = :token
          and (t.revoked = false or t.revoked is null)
          and (t.expireDate is null or t.expireDate > current timestamp)
    """)
    List<Event> findAllOwnedByUserToken(@Param("token") String token);
    @Query("""
SELECT DISTINCT e
FROM Event e
JOIN UserEvent uv ON uv.event = e
JOIN UserEvent ut ON ut.event = e
WHERE
      (uv.user.id = :viewerId AND ut.user.id = :targetId)
   OR (e.owner.id = :viewerId AND ut.user.id = :targetId)
   OR (e.owner.id = :targetId AND uv.user.id = :viewerId)
""")
    List<Event> findMutualEvents(@Param("viewerId") Integer viewerId,
                                 @Param("targetId") Integer targetId);

    @Query("""
        SELECT e
        FROM Event e
        JOIN UserEvent ue ON ue.event = e
        WHERE ue.user.id = :id
    """)
    Page<Event> findAllParticipatedByUserId(Integer id, Pageable sortedPageable);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.owner.id = :userId")
    int countCreatedEvents(@Param("userId") Integer userId);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture, 
               COUNT(e.eventId) as eventCount
        FROM User u
        LEFT JOIN Event e ON e.owner.id = u.id
        WHERE u.isBlocked = false AND u.isVerified = true
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(e.eventId) > 0
        ORDER BY eventCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopOrganizersByActivity(@Param("limit") Integer limit);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture, 
               COUNT(e.eventId) as eventCount
        FROM User u
        JOIN Event e ON e.owner.id = u.id
        JOIN SportObject so ON e.sportObject.objectId = so.objectId
        WHERE u.isBlocked = false 
          AND u.isVerified = true
          AND LOWER(so.city) = LOWER(:city)
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(e.eventId) > 0
        ORDER BY eventCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopOrganizersByLocalActivity(@Param("city") String city, @Param("limit") Integer limit);

    @Query("""
        SELECT e.eventId, e.eventName, e.imageUrl,
               so.city, s.name as sportTypeName,
               u.id, u.name, u.email, u.urlOfPicture,
               COALESCE(AVG(er.rating), 0.0) as avgRating,
               COUNT(er.eventRatingId) as totalRatings,
               COUNT(ue.id) as participantCount
        FROM Event e
        LEFT JOIN EventRating er ON er.event.eventId = e.eventId
        LEFT JOIN UserEvent ue ON ue.event.eventId = e.eventId
        JOIN SportObject so ON e.sportObject.objectId = so.objectId
        JOIN Sport s ON e.sportEv.id = s.id
        JOIN User u ON e.owner.id = u.id
        WHERE NOT EXISTS (
            SELECT 1 FROM ReportEvent re 
            WHERE re.reportedEvent.eventId = e.eventId AND re.active = true
        )
          AND u.isBlocked = false
          AND u.isVerified = true
        GROUP BY e.eventId, e.eventName, e.imageUrl, so.city, s.name, u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(er.eventRatingId) >= :minRatings
        ORDER BY avgRating DESC, totalRatings DESC
        LIMIT :limit
    """)
    List<Object[]> findTopEventsByRating(@Param("limit") Integer limit, @Param("minRatings") Integer minRatings);

    @Query("""
        SELECT e.eventId, e.eventName, e.imageUrl,
               so.city, s.name as sportTypeName,
               u.id, u.name, u.email, u.urlOfPicture,
               COALESCE(AVG(er.rating), 0.0) as avgRating,
               COUNT(er.eventRatingId) as totalRatings,
               COUNT(ue.id) as participantCount
        FROM Event e
        LEFT JOIN EventRating er ON er.event.eventId = e.eventId
        LEFT JOIN UserEvent ue ON ue.event.eventId = e.eventId
        JOIN SportObject so ON e.sportObject.objectId = so.objectId
        JOIN Sport s ON e.sportEv.id = s.id
        JOIN User u ON e.owner.id = u.id
        WHERE NOT EXISTS (
            SELECT 1 FROM ReportEvent re 
            WHERE re.reportedEvent.eventId = e.eventId AND re.active = true
        )
          AND u.isBlocked = false
          AND u.isVerified = true
        GROUP BY e.eventId, e.eventName, e.imageUrl, so.city, s.name, u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(ue.id) > 0
        ORDER BY participantCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopEventsByPopularity(@Param("limit") Integer limit);

    @Query("""
        SELECT e.eventId, e.eventName, e.imageUrl,
               so.city, s.name as sportTypeName,
               u.id, u.name, u.email, u.urlOfPicture,
               COALESCE(AVG(er.rating), 0.0) as avgRating,
               COUNT(er.eventRatingId) as totalRatings,
               COUNT(ue.id) as participantCount
        FROM Event e
        LEFT JOIN EventRating er ON er.event.eventId = e.eventId
        LEFT JOIN UserEvent ue ON ue.event.eventId = e.eventId
        JOIN SportObject so ON e.sportObject.objectId = so.objectId
        JOIN Sport s ON e.sportEv.id = s.id
        JOIN User u ON e.owner.id = u.id
        WHERE NOT EXISTS (
            SELECT 1 FROM ReportEvent re 
            WHERE re.reportedEvent.eventId = e.eventId AND re.active = true
        )
          AND u.isBlocked = false
          AND u.isVerified = true
          AND LOWER(so.city) = LOWER(:city)
        GROUP BY e.eventId, e.eventName, e.imageUrl, so.city, s.name, u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(er.eventRatingId) >= :minRatings
        ORDER BY avgRating DESC, totalRatings DESC
        LIMIT :limit
    """)
    List<Object[]> findTopEventsByLocalRating(@Param("city") String city, @Param("limit") Integer limit, @Param("minRatings") Integer minRatings);

}