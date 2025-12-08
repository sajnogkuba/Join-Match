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

}