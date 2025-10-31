package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    boolean existsByName(String name);
}
