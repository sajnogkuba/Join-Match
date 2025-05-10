package com.joinmatch.backend.repositories;

import com.joinmatch.backend.model.Event;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class EventRepository {
    private final JdbcTemplate jdbcTemplate;

    public EventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    public List<Event> findAllEvents() {

        // ← wszystkie nazwy, które w bazie mają wielkie litery, muszą być w ""
        String sql = """
        SELECT
            "event_ID",
            "number_of_participants",
            "cost",
            "Sport_object_object_ID",
            "Event_Visibility_id",
            "status",
            "score_team1",
            "score_team2"
        FROM "Event"
    """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new Event(
                rs.getInt("event_ID"),
                rs.getInt("number_of_participants"),
                rs.getBigDecimal("cost"),
                rs.getInt("Sport_object_object_ID"),   // courtId w Twoim DTO
                rs.getInt("Event_Visibility_id"),
                rs.getString("status"),
                rs.getInt("score_team1"),
                rs.getInt("score_team2")
        ));
    }

}
