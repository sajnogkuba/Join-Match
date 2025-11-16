package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Competition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionRepository extends JpaRepository<Competition, Integer> {
}
