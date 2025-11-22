package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Moderator.GetStatisticsForDashboard;
import com.joinmatch.backend.dto.Moderator.ModeratorEventReportListItemDto;
import com.joinmatch.backend.model.ReportEvent;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ModeratorService {
    private final ReportCompetitionRepository reportCompetitionRepository;
    private final ReportEventRatingRepository reportEventRatingRepository;
    private final ReportEventRepository reportEventRepository;
    private final ReportTeamRepository reportTeamRepository;
    private final ReportUserRatingRepository reportUserRatingRepository;
    private final ReportUserRepository reportUserRepository;

    public GetStatisticsForDashboard getStatisticsForDashboard(){
        long newReportsForCompetition = reportCompetitionRepository.countByReviewedIsFalse();
        long newReportsForEventRating = reportEventRatingRepository.countByReviewedIsFalse();
        long newReportsForEvent = reportEventRepository.countByReviewedIsFalse();
        long newReportsForTeam = reportTeamRepository.countByReviewedIsFalse();
        long newReportsForUserRating = reportUserRatingRepository.countByReviewedIsFalse();
        long newReportsForUser = reportUserRepository.countByReviewedIsFalse();
        return new GetStatisticsForDashboard(newReportsForCompetition,newReportsForEventRating,newReportsForEvent,newReportsForTeam,newReportsForUserRating,newReportsForUser);
    }
    @Transactional(readOnly = true)
    public Page<ModeratorEventReportListItemDto> getEventReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ReportEvent> reports = reportEventRepository.findAllByOrderByIdDesc(pageable);

        return reports.map(r -> new ModeratorEventReportListItemDto(
                r.getId(),
                r.getDescription(),

                r.getReporterUser().getId(),
                r.getReporterUser().getEmail(),
                r.getReporterUser().getName(),
                r.getReporterUser().getUrlOfPicture(),

                r.getReportedEvent().getEventId(),
                r.getReportedEvent().getEventName(),
                r.getReportedEvent().getImageUrl(),
                r.getReportedEvent().getEventDate(),

                r.getActive(),
                r.getReviewed()
        ));
    }
}
