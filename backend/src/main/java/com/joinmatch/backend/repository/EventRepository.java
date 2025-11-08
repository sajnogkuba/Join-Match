package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    @Query("SELECT MAX(e.eventId) + 1 FROM Event e")
    Long getNextId();
    @Query(value = "SELECT * FROM event LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<Event> findPage(
            @org.springframework.data.repository.query.Param("limit") int limit,
            @org.springframework.data.repository.query.Param("offset") int offset
    );
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
}