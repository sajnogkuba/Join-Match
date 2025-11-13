package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.CompetitionTeam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionTeamRepository extends JpaRepository<CompetitionTeam, Integer> {
}
