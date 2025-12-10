package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportCompetition;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportCompetitionRepository extends JpaRepository<ReportCompetition, Integer> {
    long countByReviewedIsFalse();
    boolean existsByCompetition_IdAndReporterUser_IdAndActiveTrue(Integer competitionId, Integer reporterId);

}
