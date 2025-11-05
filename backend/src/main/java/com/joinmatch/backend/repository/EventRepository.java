package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    @Query("SELECT MAX(e.eventId) + 1 FROM Event e")
    Long getNextId();
    // strona właściwa
    @Query(value = """
        SELECT *
        FROM event e
        WHERE e.status <> 'CANCELLED'
        ORDER BY e.event_date ASC, e.event_id
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<Event> findEventsPage(
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    // "probe" do wyliczenia hasMore bez COUNT
    @Query(value = """
        SELECT *
        FROM event e
        WHERE e.status <> 'CANCELLED'
        ORDER BY e.event_date ASC, e.event_id
        LIMIT :limitPlusOne OFFSET :offset
        """, nativeQuery = true)
    List<Event> findEventsPageProbe(
            @Param("limitPlusOne") int limitPlusOne,
            @Param("offset") int offset
    );
    @Query(value = "SELECT * FROM event LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<Event> findPage(
            @org.springframework.data.repository.query.Param("limit") int limit,
            @org.springframework.data.repository.query.Param("offset") int offset
    );
}
