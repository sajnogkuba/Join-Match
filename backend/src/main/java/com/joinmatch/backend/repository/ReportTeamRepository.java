package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportTeam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportTeamRepository extends JpaRepository<ReportTeam, Integer> {
    long countByReviewedIsFalse();
}
