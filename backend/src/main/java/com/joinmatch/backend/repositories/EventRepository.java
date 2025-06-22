package com.joinmatch.backend.repositories;


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
    public List<Integer> findAllEvents() {

        // ← wszystkie nazwy, które w bazie mają wielkie litery, muszą być w ""
        String sql = "SELECT cost FROM Event;";

        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getInt("cost"));
    }

}
