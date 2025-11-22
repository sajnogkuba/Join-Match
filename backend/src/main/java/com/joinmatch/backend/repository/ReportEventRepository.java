package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportEventRepository extends JpaRepository<ReportEvent,Integer> {
    long countByReviewedIsFalse();
}
