package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.SportObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SportObjectRepository extends JpaRepository<SportObject, Integer> {
    @Query("""
        SELECT DISTINCT so.city
        FROM SportObject so
        JOIN Event e ON e.sportObject.objectId = so.objectId
        ORDER BY so.city
    """)
    List<String> findDistinctCitiesFromEvents();
}
