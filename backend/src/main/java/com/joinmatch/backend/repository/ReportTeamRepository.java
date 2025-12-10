package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportTeam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportTeamRepository extends JpaRepository<ReportTeam, Integer> {
    long countByReviewedIsFalse();
    Page<ReportTeam> findAllByOrderByIdDesc(Pageable pageable);
    boolean existsByTeam_IdAndTeamReporterUser_IdAndActiveTrue(Integer teamId, Integer reporterUserId);


}
