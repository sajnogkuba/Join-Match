package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.Moderator.*;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.ModeratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModeratorServiceTest {

    @Mock
    private ReportCompetitionRepository reportCompetitionRepository;
    @Mock
    private ReportEventRatingRepository reportEventRatingRepository;
    @Mock
    private ReportEventRepository reportEventRepository;
    @Mock
    private ReportTeamRepository reportTeamRepository;
    @Mock
    private ReportUserRatingRepository reportUserRatingRepository;
    @Mock
    private ReportUserRepository reportUserRepository;

    @InjectMocks
    private ModeratorService moderatorService;

    // ----------------------------------------------------------------------
    // POMOCNICZE BUILDERY
    // ----------------------------------------------------------------------

    private User user(int id, String email, String name, String avatar) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setName(name);
        u.setUrlOfPicture(avatar);
        // kolekcje już są inicjalizowane w modelu, ale dla pewności:
        if (u.getReportEvents() == null) u.setReportEvents(new HashSet<>());
        if (u.getReportUserRatings() == null) u.setReportUserRatings(new HashSet<>());
        if (u.getTeamReportSender() == null) u.setTeamReportSender(new HashSet<>());
        if (u.getUserReportSender() == null) u.setUserReportSender(new HashSet<>());
        if (u.getSuspectUser() == null) u.setSuspectUser(new HashSet<>());
        return u;
    }

    private Event event(int id, String name, String img) {
        Event e = new Event();
        e.setEventId(id);
        e.setEventName(name);
        e.setImageUrl(img);
        e.setEventDate(LocalDateTime.now());
        if (e.getReportEvents() == null) e.setReportEvents(new HashSet<>());
        return e;
    }

    private EventRating eventRating(int id, Event event, User user, int rating, String comment) {
        EventRating er = new EventRating();
        er.setEventRatingId(id);
        er.setEvent(event);
        er.setUser(user);
        er.setRating(rating);
        er.setComment(comment);
        if (er.getReportEventRatings() == null) er.setReportEventRatings(new HashSet<>());
        return er;
    }

    private UserRating userRating(int id, User rated, User rater, int rating, String comment) {
        UserRating ur = new UserRating();
        ur.setUserRateId(id);
        ur.setRated(rated);
        ur.setRater(rater);
        ur.setRating(rating);
        ur.setComment(comment);
        if (ur.getReportUserRatings() == null) ur.setReportUserRatings(new HashSet<>());
        return ur;
    }

    private Team team(int id, String name, String photoUrl) {
        Team t = new Team();
        t.setId(id);
        t.setName(name);
        t.setPhotoUrl(photoUrl);
        if (t.getReportTeamSet() == null) t.setReportTeamSet(new HashSet<>());
        return t;
    }

    // ----------------------------------------------------------------------
    // 1) getStatisticsForDashboard
    // ----------------------------------------------------------------------

    @Test
    void getStatisticsForDashboard_shouldReturnCounts() {
        when(reportCompetitionRepository.countByReviewedIsFalse()).thenReturn(1L);
        when(reportEventRatingRepository.countByReviewedIsFalse()).thenReturn(2L);
        when(reportEventRepository.countByReviewedIsFalse()).thenReturn(3L);
        when(reportTeamRepository.countByReviewedIsFalse()).thenReturn(4L);
        when(reportUserRatingRepository.countByReviewedIsFalse()).thenReturn(5L);
        when(reportUserRepository.countByReviewedIsFalse()).thenReturn(6L);

        GetStatisticsForDashboard stats = moderatorService.getStatisticsForDashboard();

        assertEquals(1L, stats.numberOfRecentReportsCompetitions());
        assertEquals(2L, stats.numberOfRecentReportsEventRatings());
        assertEquals(3L, stats.numberOfRecentReportsEvents());
        assertEquals(4L, stats.numberOfRecentReportsTeams());
        assertEquals(5L, stats.numberOfRecentReportsUserRating());
        assertEquals(6L, stats.numberOfRecentReportsUser());
    }

    // ----------------------------------------------------------------------
    // 2) Event reports
    // ----------------------------------------------------------------------

    @Test
    void getEventReports_shouldMapToDto() {
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");
        Event ev = event(20, "EventName", "img.png");

        ReportEvent re = new ReportEvent();
        re.setId(1);
        re.setDescription("desc");
        re.setReporterUser(reporter);
        re.setReportedEvent(ev);
        re.setActive(true);
        re.setReviewed(false);

        Page<ReportEvent> page = new PageImpl<>(List.of(re));

        when(reportEventRepository.findAllByOrderByIdDesc(PageRequest.of(0, 5)))
                .thenReturn(page);

        Page<ModeratorEventReportListItemDto> result = moderatorService.getEventReports(0, 5);

        assertEquals(1, result.getTotalElements());
        ModeratorEventReportListItemDto dto = result.getContent().get(0);

        assertEquals(1, dto.id());
        assertEquals("desc", dto.description());
        assertEquals(reporter.getId(), dto.reporterId());
        assertEquals(ev.getEventId(), dto.eventId());
        assertEquals(ev.getEventName(), dto.eventName());
        assertEquals(ev.getImageUrl(), dto.eventImageUrl());

        // Uwaga: w serwisie viewed = r.getActive(), active = r.getReviewed()
        assertEquals(true, dto.viewed());
        assertEquals(false, dto.active());
    }

    @Test
    void acceptReportEvent_shouldSetActiveTrueAndSave() {
        ReportEvent re = new ReportEvent();
        re.setId(5);
        re.setActive(false);

        when(reportEventRepository.findById(5)).thenReturn(Optional.of(re));

        moderatorService.acceptReportEvent(5);

        assertTrue(re.getActive());
        verify(reportEventRepository).save(re);
    }

    @Test
    void rejectReportEvent_shouldSetActiveFalseAndSave() {
        ReportEvent re = new ReportEvent();
        re.setId(5);
        re.setActive(true);

        when(reportEventRepository.findById(5)).thenReturn(Optional.of(re));

        moderatorService.rejectReportEvent(5);

        assertFalse(re.getActive());
        verify(reportEventRepository).save(re);
    }

    @Test
    void markAsViewedReportEvent_shouldSetReviewedTrue() {
        ReportEvent re = new ReportEvent();
        re.setId(5);
        re.setReviewed(false);

        when(reportEventRepository.findById(5)).thenReturn(Optional.of(re));

        moderatorService.markAsViewedReportEvent(5);

        assertTrue(re.getReviewed());
        verify(reportEventRepository).save(re);
    }

    @Test
    void markAsUnviewedReportEvent_shouldSetReviewedFalse() {
        ReportEvent re = new ReportEvent();
        re.setId(5);
        re.setReviewed(true);

        when(reportEventRepository.findById(5)).thenReturn(Optional.of(re));

        moderatorService.markAsUnviewedReportEvent(5);

        assertFalse(re.getReviewed());
        verify(reportEventRepository).save(re);
    }

    @Test
    void deleteReportEvent_shouldRemoveFromCollectionsAndDelete() {
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");
        Event ev = event(20, "EventName", "img.png");

        ReportEvent re = new ReportEvent();
        re.setId(7);
        re.setReporterUser(reporter);
        re.setReportedEvent(ev);

        reporter.getReportEvents().add(re);
        ev.getReportEvents().add(re);

        when(reportEventRepository.findById(7)).thenReturn(Optional.of(re));

        moderatorService.deleteReportEvent(7);

        assertFalse(reporter.getReportEvents().contains(re));
        assertFalse(ev.getReportEvents().contains(re));
        verify(reportEventRepository).delete(re);
    }

    // ----------------------------------------------------------------------
    // 3) EventRating reports
    // ----------------------------------------------------------------------

    @Test
    void getEventRatingReports_shouldMapToDto() {
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");
        User rater = user(30, "rater@test.com", "Rater", "r.png");
        Event ev = event(20, "EventName", "img.png");
        EventRating er = eventRating(40, ev, rater, 5, "Good!");

        ReportEventRating rer = ReportEventRating.builder()
                .id(1)
                .description("desc")
                .active(true)
                .reviewed(false)
                .eventRating(er)
                .reporterUser(reporter)
                .build();

        Page<ReportEventRating> page = new PageImpl<>(List.of(rer));

        when(reportEventRatingRepository.findAllByOrderByIdDesc(PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ModeratorEventRatingReportListItemDto> result =
                moderatorService.getEventRatingReports(0, 10);

        assertEquals(1, result.getTotalElements());
        ModeratorEventRatingReportListItemDto dto = result.getContent().get(0);

        assertEquals(rer.getId(), dto.id());
        assertEquals(rer.getDescription(), dto.description());
        assertEquals(ev.getEventId(), dto.eventId());
        assertEquals(ev.getEventName(), dto.eventName());
        assertEquals(ev.getImageUrl(), dto.eventImageUrl());
        assertEquals(rater.getId(), dto.idRater());
        assertEquals(er.getRating(), dto.rate());
        assertEquals(er.getComment(), dto.commentRate());
        assertEquals(rer.getReviewed(), dto.viewed());
        assertEquals(rer.getActive(), dto.active());
    }

    @Test
    void acceptReportEventRating_shouldSetActiveTrueAndSave() {
        ReportEventRating r = new ReportEventRating();
        r.setId(11);
        r.setActive(false);

        when(reportEventRatingRepository.findById(11)).thenReturn(Optional.of(r));

        moderatorService.acceptReportEventRating(11);

        assertTrue(r.getActive());
        verify(reportEventRatingRepository).save(r);
    }

    @Test
    void rejectReportEventRating_shouldSetActiveFalseAndSave() {
        ReportEventRating r = new ReportEventRating();
        r.setId(11);
        r.setActive(true);

        when(reportEventRatingRepository.findById(11)).thenReturn(Optional.of(r));

        moderatorService.rejectReportEventRating(11);

        assertFalse(r.getActive());
        verify(reportEventRatingRepository).save(r);
    }

    @Test
    void markAsViewedReportEventRating_shouldSetReviewedTrue() {
        ReportEventRating r = new ReportEventRating();
        r.setId(11);
        r.setReviewed(false);

        when(reportEventRatingRepository.findById(11)).thenReturn(Optional.of(r));

        moderatorService.markAsViewedReportEventRating(11);

        assertTrue(r.getReviewed());
        verify(reportEventRatingRepository).save(r);
    }

    @Test
    void markAsUnviewedReportEventRating_shouldSetReviewedFalse() {
        ReportEventRating r = new ReportEventRating();
        r.setId(11);
        r.setReviewed(true);

        when(reportEventRatingRepository.findById(11)).thenReturn(Optional.of(r));

        moderatorService.markAsUnviewedReportEventRating(11);

        assertFalse(r.getReviewed());
        verify(reportEventRatingRepository).save(r);
    }

    @Test
    void deleteReportEventRating_shouldRemoveFromCollectionsAndDelete() {
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");
        User rater = user(30, "rater@test.com", "Rater", "r.png");
        Event ev = event(20, "EventName", "img.png");
        EventRating er = eventRating(40, ev, rater, 5, "Good!");

        ReportEventRating r = ReportEventRating.builder()
                .id(99)
                .reporterUser(reporter)
                .eventRating(er)
                .build();

        // powiązania
        reporter.getReportEventRatings().add(r);
        er.getReportEventRatings().add(r);

        when(reportEventRatingRepository.findById(99)).thenReturn(Optional.of(r));

        moderatorService.deleteReportEventRating(99);

        assertFalse(reporter.getReportEventRatings().contains(r));
        assertFalse(er.getReportEventRatings().contains(r));
        verify(reportEventRatingRepository).delete(r);
    }

    // ----------------------------------------------------------------------
    // 4) UserRating reports
    // ----------------------------------------------------------------------

    @Test
    void getUserRatingReports_shouldMapToDto() {
        User rated = user(50, "rated@test.com", "Rated", "ra.png");
        User reporter = user(60, "rep@test.com", "Reporter", "rep.png");
        User rater = user(70, "rater@test.com", "Rater", "r.png");

        UserRating ur = userRating(123, rated, rater, 4, "OK");

        ReportUserRating rur = ReportUserRating.builder()
                .id(1)
                .userRating(ur)
                .description("inzynieria")
                .active(true)
                .reviewed(false)
                .userRatingReporter(reporter)
                .build();

        Page<ReportUserRating> page = new PageImpl<>(List.of(rur));

        when(reportUserRatingRepository.findAllByOrderByIdDesc(PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<UserRateReportDto> result = moderatorService.getUserRatingReports(0, 10);

        assertEquals(1, result.getTotalElements());
        UserRateReportDto dto = result.getContent().get(0);

        assertEquals(rur.getId(), dto.id());
        assertEquals(ur.getUserRateId(), dto.rateId());
        assertEquals(ur.getComment(), dto.rateDescription());
        assertEquals(ur.getRating(), dto.numberOfStars());
        assertEquals(rated.getId(), dto.ratedUserId());
        assertEquals(rated.getEmail(), dto.ratedUserEmail());
        assertEquals(rated.getName(), dto.ratedUserUsername());
        assertEquals(rated.getUrlOfPicture(), dto.ratedUserAvatar());
        assertEquals(reporter.getId(), dto.reporterUserId());
        assertEquals(rur.getDescription(), dto.description());
        assertEquals(rur.getActive(), dto.active());
        assertEquals(rur.getReviewed(), dto.reviewed());
    }

    @Test
    void acceptReportUserRating_shouldSetActiveTrue() {
        ReportUserRating r = new ReportUserRating();
        r.setId(10);
        r.setActive(false);

        when(reportUserRatingRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.acceptReportUserRating(10);

        assertTrue(r.getActive());
        verify(reportUserRatingRepository).save(r);
    }

    @Test
    void rejectReportUserRating_shouldSetActiveFalse() {
        ReportUserRating r = new ReportUserRating();
        r.setId(10);
        r.setActive(true);

        when(reportUserRatingRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.rejectReportUserRating(10);

        assertFalse(r.getActive());
        verify(reportUserRatingRepository).save(r);
    }

    @Test
    void markAsViewedReportUserRating_shouldSetReviewedTrue() {
        ReportUserRating r = new ReportUserRating();
        r.setId(10);
        r.setReviewed(false);

        when(reportUserRatingRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.markAsViewedReportUserRating(10);

        assertTrue(r.getReviewed());
        verify(reportUserRatingRepository).save(r);
    }

    @Test
    void markAsUnviewedReportUserRating_shouldSetReviewedFalse() {
        ReportUserRating r = new ReportUserRating();
        r.setId(10);
        r.setReviewed(true);

        when(reportUserRatingRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.markAsUnviewedReportUserRating(10);

        assertFalse(r.getReviewed());
        verify(reportUserRatingRepository).save(r);
    }

    @Test
    void deleteReportUserRating_shouldRemoveFromCollectionsAndDelete() {
        User rated = user(50, "rated@test.com", "Rated", "ra.png");
        User reporter = user(60, "rep@test.com", "Reporter", "rep.png");
        User rater = user(70, "rater@test.com", "Rater", "r.png");

        UserRating ur = userRating(123, rated, rater, 4, "OK");

        ReportUserRating r = ReportUserRating.builder()
                .id(88)
                .userRating(ur)
                .userRatingReporter(reporter)
                .build();

        reporter.getReportUserRatings().add(r);
        ur.getReportUserRatings().add(r);

        when(reportUserRatingRepository.findById(88)).thenReturn(Optional.of(r));

        moderatorService.deleteReportUserRating(88);

        assertFalse(reporter.getReportUserRatings().contains(r));
        assertFalse(ur.getReportUserRatings().contains(r));
        verify(reportUserRatingRepository).delete(r);
    }

    // ----------------------------------------------------------------------
    // 5) Team reports
    // ----------------------------------------------------------------------

    @Test
    void getTeamReports_shouldMapToDto() {
        Team t = team(7, "TeamX", "team.png");
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");

        ReportTeam rt = ReportTeam.builder()
                .id(1)
                .team(t)
                .teamReporterUser(reporter)
                .description("reportDesc")
                .active(true)
                .reviewed(false)
                .build();

        Page<ReportTeam> page = new PageImpl<>(List.of(rt));

        when(reportTeamRepository.findAllByOrderByIdDesc(PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ModeratorTeamReportDto> result = moderatorService.getTeamReports(0, 10);

        assertEquals(1, result.getTotalElements());
        ModeratorTeamReportDto dto = result.getContent().get(0);

        assertEquals(rt.getId(), dto.id());
        assertEquals(t.getId(), dto.teamId());
        assertEquals(t.getName(), dto.teamName());
        assertEquals(t.getPhotoUrl(), dto.teamAvatarUrl());
        assertEquals(reporter.getId(), dto.reporterUserId());
        assertEquals(rt.getDescription(), dto.description());
        assertEquals(rt.getActive(), dto.active());
        assertEquals(rt.isReviewed(), dto.reviewed());
    }

    @Test
    void acceptReportTeam_shouldSetActiveTrue() {
        ReportTeam rt = new ReportTeam();
        rt.setId(10);
        rt.setActive(false);

        when(reportTeamRepository.findById(10)).thenReturn(Optional.of(rt));

        moderatorService.acceptReportTeam(10);

        assertTrue(rt.getActive());
        verify(reportTeamRepository).save(rt);
    }

    @Test
    void rejectReportTeam_shouldSetActiveFalse() {
        ReportTeam rt = new ReportTeam();
        rt.setId(10);
        rt.setActive(true);

        when(reportTeamRepository.findById(10)).thenReturn(Optional.of(rt));

        moderatorService.rejectReportTeam(10);

        assertFalse(rt.getActive());
        verify(reportTeamRepository).save(rt);
    }

    @Test
    void markAsViewedReportTeam_shouldSetReviewedTrue() {
        ReportTeam rt = new ReportTeam();
        rt.setId(10);
        rt.setReviewed(false);

        when(reportTeamRepository.findById(10)).thenReturn(Optional.of(rt));

        moderatorService.markAsViewedReportTeam(10);

        assertTrue(rt.isReviewed());
        verify(reportTeamRepository).save(rt);
    }

    @Test
    void markAsUnviewedReportTeam_shouldSetReviewedFalse() {
        ReportTeam rt = new ReportTeam();
        rt.setId(10);
        rt.setReviewed(true);

        when(reportTeamRepository.findById(10)).thenReturn(Optional.of(rt));

        moderatorService.markAsUnviewedReportTeam(10);

        assertFalse(rt.isReviewed());
        verify(reportTeamRepository).save(rt);
    }

    @Test
    void deleteReportTeam_shouldRemoveFromCollectionsAndDelete() {
        Team t = team(7, "TeamX", "team.png");
        User reporter = user(10, "rep@test.com", "Reporter", "avatar.png");

        ReportTeam rt = ReportTeam.builder()
                .id(99)
                .team(t)
                .teamReporterUser(reporter)
                .build();

        t.getReportTeamSet().add(rt);
        reporter.getTeamReportSender().add(rt);

        when(reportTeamRepository.findById(99)).thenReturn(Optional.of(rt));

        moderatorService.deleteReportTeam(99);

        assertFalse(t.getReportTeamSet().contains(rt));
        assertFalse(reporter.getTeamReportSender().contains(rt));
        verify(reportTeamRepository).delete(rt);
    }

    // ----------------------------------------------------------------------
    // 6) User reports
    // ----------------------------------------------------------------------

    @Test
    void getUserReports_shouldMapToDto() {
        User suspect = user(50, "suspect@test.com", "Suspect", "sus.png");
        User reporter = user(60, "rep@test.com", "Reporter", "rep.png");

        ReportUser ru = ReportUser.builder()
                .id(1)
                .suspectUser(suspect)
                .reporterUser(reporter)
                .description("spam")
                .active(true)
                .reviewed(false)
                .build();

        Page<ReportUser> page = new PageImpl<>(List.of(ru));

        when(reportUserRepository.findAllByOrderByIdDesc(PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ModeratorUserReportDto> result = moderatorService.getUserReports(0, 10);

        assertEquals(1, result.getTotalElements());
        ModeratorUserReportDto dto = result.getContent().get(0);

        assertEquals(ru.getId(), dto.id());
        assertEquals(suspect.getId(), dto.reportedUserId());
        assertEquals(suspect.getEmail(), dto.reportedUserEmail());
        assertEquals(suspect.getName(), dto.reportedUsername());
        assertEquals(suspect.getUrlOfPicture(), dto.reportedUserAvatarUrl());
        assertEquals(reporter.getId(), dto.reporterUserId());
        assertEquals(reporter.getEmail(), dto.reporterUserEmail());
        assertEquals(ru.getDescription(), dto.description());
        assertEquals(ru.getActive(), dto.active());
        assertEquals(ru.isReviewed(), dto.viewed());
    }

    @Test
    void acceptReportUser_shouldSetActiveTrue() {
        ReportUser r = new ReportUser();
        r.setId(10);
        r.setActive(false);

        when(reportUserRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.acceptReportUser(10);

        assertTrue(r.getActive());
        verify(reportUserRepository).save(r);
    }

    @Test
    void rejectReportUser_shouldSetActiveFalse() {
        ReportUser r = new ReportUser();
        r.setId(10);
        r.setActive(true);

        when(reportUserRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.rejectReportUser(10);

        assertFalse(r.getActive());
        verify(reportUserRepository).save(r);
    }

    @Test
    void markAsViewedReportUser_shouldSetReviewedTrue() {
        ReportUser r = new ReportUser();
        r.setId(10);
        r.setReviewed(false);

        when(reportUserRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.markAsViewedReportUser(10);

        assertTrue(r.isReviewed());
        verify(reportUserRepository).save(r);
    }

    @Test
    void markAsUnviewedReportUser_shouldSetReviewedFalse() {
        ReportUser r = new ReportUser();
        r.setId(10);
        r.setReviewed(true);

        when(reportUserRepository.findById(10)).thenReturn(Optional.of(r));

        moderatorService.markAsUnviewedReportUser(10);

        assertFalse(r.isReviewed());
        verify(reportUserRepository).save(r);
    }

    @Test
    void deleteReportUser_shouldRemoveFromCollectionsAndDelete() {
        User suspect = user(50, "suspect@test.com", "Suspect", "sus.png");
        User reporter = user(60, "rep@test.com", "Reporter", "rep.png");

        ReportUser ru = ReportUser.builder()
                .id(77)
                .suspectUser(suspect)
                .reporterUser(reporter)
                .build();

        suspect.getSuspectUser().add(ru);
        reporter.getUserReportSender().add(ru);

        when(reportUserRepository.findById(77)).thenReturn(Optional.of(ru));

        moderatorService.deleteReportUser(77);

        assertFalse(suspect.getSuspectUser().contains(ru));
        assertFalse(reporter.getUserReportSender().contains(ru));
        verify(reportUserRepository).delete(ru);
    }
}
