package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Moderator.GetStatisticsForDashboard;
import com.joinmatch.backend.dto.Moderator.ModeratorEventRatingReportListItemDto;
import com.joinmatch.backend.dto.Moderator.ModeratorEventReportListItemDto;
import com.joinmatch.backend.model.ReportEvent;
import com.joinmatch.backend.model.ReportEventRating;
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

    public void rejectReportEvent(Integer idReportEvent) {
        ReportEvent reportEvent = reportEventRepository.findById(idReportEvent).orElseThrow(() -> new IllegalArgumentException());
        reportEvent.setActive(false);
        reportEventRepository.save(reportEvent);
    }

    public void markAsViewedReportEvent(Integer idReportEvent) {
        ReportEvent reportEvent = reportEventRepository.findById(idReportEvent).orElseThrow(() -> new IllegalArgumentException());
        reportEvent.setReviewed(true);
        reportEventRepository.save(reportEvent);
    }

    public void acceptReportEvent(Integer idReportEvent) {
        ReportEvent reportEvent = reportEventRepository.findById(idReportEvent).orElseThrow(() -> new IllegalArgumentException());
        reportEvent.setActive(true);
        reportEventRepository.save(reportEvent);
    }

    public void deleteReportEvent(Integer idReportEvent) {
        ReportEvent reportEvent = reportEventRepository.findById(idReportEvent).orElseThrow(() -> new IllegalArgumentException());
        reportEvent.getReporterUser().getReportEvents().remove(reportEvent);
        reportEvent.getReportedEvent().getReportEvents().remove(reportEvent);
        reportEventRepository.delete(reportEvent);
    }

    public void markAsUnviewedReportEvent(Integer idReportEvent) {
        ReportEvent reportEvent = reportEventRepository.findById(idReportEvent).orElseThrow(() -> new IllegalArgumentException());
        reportEvent.setReviewed(false);
        reportEventRepository.save(reportEvent);
    }

    public Page<ModeratorEventRatingReportListItemDto> getEventRatingReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ReportEventRating> reports = reportEventRatingRepository.findAllByOrderByIdDesc(pageable);

        return reports.map(r -> new ModeratorEventRatingReportListItemDto(
                r.getId(),
                r.getDescription(),
                r.getReporterUser().getId(),
                r.getReporterUser().getEmail(),
                r.getReporterUser().getName(),
                r.getReporterUser().getUrlOfPicture(),
                r.getEventRating().getEvent().getEventId(),
                r.getEventRating().getEvent().getEventName(),
                r.getEventRating().getEvent().getImageUrl(),
                r.getEventRating().getUser().getId(),
                r.getEventRating().getRating(),
                r.getEventRating().getComment(),
                r.getActive(),
                r.getReviewed()
        ));
    }

    public void acceptReportEventRating(Integer idReportEventRating) {
        ReportEventRating reportEventRating = reportEventRatingRepository.findById(idReportEventRating).orElseThrow(() -> new IllegalArgumentException());
        reportEventRating.setActive(true);
        reportEventRatingRepository.save(reportEventRating);
    }

    public void rejectReportEventRating(Integer idReportEventRating) {
        ReportEventRating reportEventRating = reportEventRatingRepository.findById(idReportEventRating).orElseThrow(() -> new IllegalArgumentException());
        reportEventRating.setActive(false);
        reportEventRatingRepository.save(reportEventRating);
    }

    public void markAsViewedReportEventRating(Integer idReportEventRating) {
        ReportEventRating reportEventRating = reportEventRatingRepository.findById(idReportEventRating).orElseThrow(() -> new IllegalArgumentException());
        reportEventRating.setReviewed(true);
        reportEventRatingRepository.save(reportEventRating);
    }

    public void markAsUnviewedReportEventRating(Integer idReportEventRating) {
        ReportEventRating reportEventRating = reportEventRatingRepository.findById(idReportEventRating).orElseThrow(() -> new IllegalArgumentException());
        reportEventRating.setReviewed(false);
        reportEventRatingRepository.save(reportEventRating);
    }

    public void deleteReportEventRating(Integer idReportEventRating) {
        ReportEventRating reportEventRating = reportEventRatingRepository.findById(idReportEventRating).orElseThrow(() -> new IllegalArgumentException());
        reportEventRating.getReporterUser().getReportEvents().remove(reportEventRating);
        reportEventRating.getEventRating().getReportEventRatings().remove(reportEventRating);
        reportEventRatingRepository.delete(reportEventRating);
    }
}
