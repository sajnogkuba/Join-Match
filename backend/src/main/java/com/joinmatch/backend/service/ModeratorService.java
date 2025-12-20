package com.joinmatch.backend.service;

import com.joinmatch.backend.config.TokenExtractor;
import com.joinmatch.backend.dto.Moderator.*;
import com.joinmatch.backend.enums.Role;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ModeratorService {
    private final ReportCompetitionRepository reportCompetitionRepository;
    private final ReportEventRatingRepository reportEventRatingRepository;
    private final ReportEventRepository reportEventRepository;
    private final ReportTeamRepository reportTeamRepository;
    private final ReportUserRatingRepository reportUserRatingRepository;
    private final ReportUserRepository reportUserRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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
                r.getReviewed(),
                r.getActive()
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
        reportEventRating.getReporterUser().getReportEventRatings().remove(reportEventRating);
        reportEventRating.getEventRating().getReportEventRatings().remove(reportEventRating);
        reportEventRatingRepository.delete(reportEventRating);
    }
    public Page<UserRateReportDto> getUserRatingReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ReportUserRating> reports = reportUserRatingRepository.findAllByOrderByIdDesc(pageable);

        return reports.map(r -> new UserRateReportDto(
                r.getId(),
                r.getUserRating().getUserRateId(),
                r.getUserRating().getComment(),
                r.getUserRating().getRating(),
                r.getUserRating().getRated().getId(),
                r.getUserRating().getRated().getEmail(),
                r.getUserRating().getRated().getName(),
                r.getUserRating().getRated().getUrlOfPicture(),
                r.getUserRatingReporter().getId(),
                r.getUserRatingReporter().getEmail(),
                r.getUserRatingReporter().getName(),
                r.getUserRatingReporter().getUrlOfPicture(),
                r.getDescription(),
                r.getActive(),
                r.getReviewed()
        ));
    }

    public void acceptReportUserRating(Integer idReportUserRating) {
        ReportUserRating reportUserRating = reportUserRatingRepository.findById(idReportUserRating).orElseThrow(() -> new IllegalArgumentException());
        reportUserRating.setActive(true);
        reportUserRatingRepository.save(reportUserRating);
    }

    public void rejectReportUserRating(Integer idReportUserRating) {
        ReportUserRating reportUserRating = reportUserRatingRepository.findById(idReportUserRating).orElseThrow(() -> new IllegalArgumentException());
        reportUserRating.setActive(false);
        reportUserRatingRepository.save(reportUserRating);
    }

    public void markAsViewedReportUserRating(Integer idReportUserRating) {
        ReportUserRating reportUserRating = reportUserRatingRepository.findById(idReportUserRating).orElseThrow(() -> new IllegalArgumentException());
        reportUserRating.setReviewed(true);
        reportUserRatingRepository.save(reportUserRating);
    }

    public void markAsUnviewedReportUserRating(Integer idReportUserRating) {
        ReportUserRating reportUserRating = reportUserRatingRepository.findById(idReportUserRating).orElseThrow(() -> new IllegalArgumentException());
        reportUserRating.setReviewed(false);
        reportUserRatingRepository.save(reportUserRating);
    }

    public void deleteReportUserRating(Integer idReportUserRating) {
        ReportUserRating reportUserRating = reportUserRatingRepository.findById(idReportUserRating).orElseThrow(() -> new IllegalArgumentException());
        reportUserRating.getUserRatingReporter().getReportUserRatings().remove(reportUserRating);
        reportUserRating.getUserRating().getReportUserRatings().remove(reportUserRating);
        reportUserRatingRepository.delete(reportUserRating);
    }

    public Page<ModeratorTeamReportDto> getTeamReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ReportTeam> reports = reportTeamRepository.findAllByOrderByIdDesc(pageable);

        return reports.map(r -> new ModeratorTeamReportDto(
                r.getId(),
                r.getTeam().getId(),
                r.getTeam().getName(),
                r.getTeam().getPhotoUrl(),
                r.getTeamReporterUser().getId(),
                r.getTeamReporterUser().getEmail(),
                r.getTeamReporterUser().getName(),
                r.getTeamReporterUser().getUrlOfPicture(),
                r.getDescription(),
                r.getActive(),
                r.isReviewed()
        ));
    }

    public void acceptReportTeam(Integer idReportTeam) {
        ReportTeam referenceById = reportTeamRepository.findById(idReportTeam).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setActive(true);
        reportTeamRepository.save(referenceById);
    }

    public void rejectReportTeam(Integer idReportTeam) {
        ReportTeam referenceById = reportTeamRepository.findById(idReportTeam).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setActive(false);
        reportTeamRepository.save(referenceById);
    }

    public void markAsViewedReportTeam(Integer idReportTeam) {
        ReportTeam referenceById = reportTeamRepository.findById(idReportTeam).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setReviewed(true);
        reportTeamRepository.save(referenceById);
    }

    public void markAsUnviewedReportTeam(Integer idReportTeam) {
        ReportTeam referenceById = reportTeamRepository.findById(idReportTeam).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setReviewed(false);
        reportTeamRepository.save(referenceById);

    }

    public void deleteReportTeam(Integer idReportTeam) {
        ReportTeam referenceById = reportTeamRepository.findById(idReportTeam).orElseThrow(()-> new IllegalArgumentException());
        referenceById.getTeam().getReportTeamSet().remove(referenceById);
        referenceById.getTeamReporterUser().getTeamReportSender().remove(referenceById);
        reportTeamRepository.delete(referenceById);

    }

    public Page<ModeratorUserReportDto> getUserReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ReportUser> reports = reportUserRepository.findAllByOrderByIdDesc(pageable);

        return reports.map(r -> new ModeratorUserReportDto(
                r.getId(),
                r.getSuspectUser().getId(),
                r.getSuspectUser().getEmail(),
                r.getSuspectUser().getName(),
                r.getSuspectUser().getUrlOfPicture(),
                r.getReporterUser().getId(),
                r.getReporterUser().getEmail(),
                r.getReporterUser().getName(),
                r.getReporterUser().getUrlOfPicture(),
                r.getDescription(),
                r.getActive(),
                r.isReviewed()
        ));
    }

    public void acceptReportUser(Integer idReportUser) {
        ReportUser referenceById = reportUserRepository.findById(idReportUser).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setActive(true);
        reportUserRepository.save(referenceById);

    }

    public void rejectReportUser(Integer idReportUser) {
        ReportUser referenceById = reportUserRepository.findById(idReportUser).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setActive(false);
        reportUserRepository.save(referenceById);

    }

    public void markAsViewedReportUser(Integer idReportUser) {
        ReportUser referenceById = reportUserRepository.findById(idReportUser).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setReviewed(true);
        reportUserRepository.save(referenceById);

    }

    public void markAsUnviewedReportUser(Integer idReportUser) {
        ReportUser referenceById = reportUserRepository.findById(idReportUser).orElseThrow(()-> new IllegalArgumentException());
        referenceById.setReviewed(false);
        reportUserRepository.save(referenceById);
    }

    public void deleteReportUser(Integer idReportUser) {
        ReportUser referenceById = reportUserRepository.findById(idReportUser).orElseThrow(()-> new IllegalArgumentException());
        referenceById.getSuspectUser().getSuspectUser().remove(referenceById);
        referenceById.getReporterUser().getUserReportSender().remove(referenceById);
        reportUserRepository.delete(referenceById);

    }

    public void authenticate(HttpServletRequest httpServletRequest) {
        String token = TokenExtractor.extractToken(httpServletRequest);
        if (token == null) {
            throw new IllegalArgumentException("No token found");
        }
        Optional<User> byTokenValue = userRepository.findByTokenValue(token);
        if (!byTokenValue.isPresent()) {
            throw new IllegalArgumentException("No users found");
        }
        User user = byTokenValue.get();
        System.out.println("Here ===============================================================");
        if((!user.getRole().equals(Role.MODERATOR) && (!user.getRole().equals(Role.ADMIN)))){
            throw new IllegalArgumentException("Not authorised");
        }
    }

    public void sendWarning(ModeratorWarningRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.usermailOfReceiver())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        notificationService.sendModeratorWarning(user);
    }
}
