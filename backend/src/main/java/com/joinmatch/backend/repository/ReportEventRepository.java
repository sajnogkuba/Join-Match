package com.joinmatch.backend.repository;

import com.joinmatch.backend.dto.Moderator.ModeratorEventReportListItemDto;
import com.joinmatch.backend.model.ReportEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReportEventRepository extends JpaRepository<ReportEvent,Integer> {
    long countByReviewedIsFalse();
    Page<ReportEvent> findAllByOrderByIdDesc(Pageable pageable);
    boolean existsByReportedEvent_EventIdAndReporterUser_IdAndActiveTrue(Integer eventId, Integer userId);
}
