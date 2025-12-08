package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.EventRating.EventRatingRequestDto;
import com.joinmatch.backend.dto.EventRating.EventRatingResponseDto;
import com.joinmatch.backend.dto.OrganizerRating.OrganizerRatingRequestDto;
import com.joinmatch.backend.dto.OrganizerRating.OrganizerRatingResponseDto;
import com.joinmatch.backend.dto.Reports.EventRatingReportDto;
import com.joinmatch.backend.dto.Reports.UserRatingReportDto;
import com.joinmatch.backend.dto.UserRating.UserRatingRequestDto;
import com.joinmatch.backend.dto.UserRating.UserRatingResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.RatingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private UserRatingRepository userRatingRepository;
    @Mock
    private EventRatingRepository eventRatingRepository;
    @Mock
    private UserEventRepository userEventRepository;
    @Mock
    private OrganizerRatingRepository organizerRatingRepository;
    @Mock
    private ReportEventRatingRepository reportEventRatingRepository;
    @Mock
    private ReportUserRatingRepository reportUserRatingRepository;

    @InjectMocks
    private RatingService ratingService;

    // -------------------------------------------------------
    // addUserRating
    // -------------------------------------------------------

    @Test
    void addUserRating_shouldSaveAndReturnDto_whenValid() {
        User rater = new User();
        rater.setId(1);
        rater.setEmail("rater@test.com");
        rater.setName("Rater");
        rater.setUrlOfPicture("avatar_r");

        User rated = new User();
        rated.setId(2);

        UserRatingRequestDto req = new UserRatingRequestDto(
                1,
                2,
                4,
                "Super gracz"
        );

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(rated));
        when(userRatingRepository.existsByRaterAndRated(rater, rated)).thenReturn(false);
        when(userEventRepository.haveCommonEventOrOrganizer(1, 2)).thenReturn(true);

        when(userRatingRepository.save(any(UserRating.class))).thenAnswer(inv -> {
            UserRating rating = inv.getArgument(0);
            rating.setUserRateId(10);
            rating.setCreatedAt(LocalDateTime.now());
            return rating;
        });

        UserRatingResponseDto out = ratingService.addUserRating(req);

        assertEquals(10, out.id());
        assertEquals("rater@test.com", out.userEmail());
        assertEquals(4, out.rating());
        assertEquals("Super gracz", out.comment());
        assertEquals("Rater", out.raterName());
        assertNotNull(out.createdAt());
        assertEquals("avatar_r", out.raterAvatarUrl());

        verify(userRatingRepository).save(any(UserRating.class));
    }

    @Test
    void addUserRating_shouldThrow_whenAlreadyRated() {
        User rater = new User();
        rater.setId(1);
        User rated = new User();
        rated.setId(2);

        UserRatingRequestDto req = new UserRatingRequestDto(1, 2, 5, "Komentarz");

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(rated));
        when(userRatingRepository.existsByRaterAndRated(rater, rated)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> ratingService.addUserRating(req));
    }

    @Test
    void addUserRating_shouldThrow_whenNoCommonEvent() {
        User rater = new User();
        rater.setId(1);
        User rated = new User();
        rated.setId(2);

        UserRatingRequestDto req = new UserRatingRequestDto(1, 2, 5, "Komentarz");

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(rated));
        when(userRatingRepository.existsByRaterAndRated(rater, rated)).thenReturn(false);
        when(userEventRepository.haveCommonEventOrOrganizer(1, 2)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> ratingService.addUserRating(req));
    }

    // -------------------------------------------------------
    // getRatingsByUser
    // -------------------------------------------------------

    @Test
    void getRatingsByUser_shouldReturnMappedDtos() {
        User rater = new User();
        rater.setId(1);
        rater.setEmail("r@e.com");
        rater.setName("Rater");
        rater.setUrlOfPicture("url");

        UserRating rating = new UserRating();
        rating.setUserRateId(10);
        rating.setRater(rater);
        rating.setRating(4);
        rating.setComment("OK");
        rating.setCreatedAt(LocalDateTime.now());

        when(userRatingRepository.findByRated_Id(5)).thenReturn(List.of(rating));

        List<UserRatingResponseDto> out = ratingService.getRatingsByUser(5);

        assertEquals(1, out.size());
        assertEquals(10, out.get(0).id());
        assertEquals("r@e.com", out.get(0).userEmail());
        assertEquals(4, out.get(0).rating());
        assertEquals("OK", out.get(0).comment());
        assertEquals("Rater", out.get(0).raterName());
        assertEquals("url", out.get(0).raterAvatarUrl());
    }

    // -------------------------------------------------------
    // addEventRating
    // -------------------------------------------------------

    @Test
    void addEventRating_shouldSaveAndReturnDto_whenValid() {
        User user = new User();
        user.setId(1);
        user.setName("User");

        Event event = new Event();
        event.setEventId(10);

        EventRatingRequestDto req = new EventRatingRequestDto(1, 10, 5, "Super event");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(eventRatingRepository.existsByUserAndEvent(user, event)).thenReturn(false);
        when(userEventRepository.existsByUserAndEvent(user, event)).thenReturn(true);

        when(eventRatingRepository.save(any(EventRating.class))).thenAnswer(inv -> {
            EventRating er = inv.getArgument(0);
            er.setEventRatingId(100);
            er.setCreatedAt(LocalDateTime.now());
            return er;
        });

        EventRatingResponseDto out = ratingService.addEventRating(req);

        assertEquals(100, out.id());
        assertEquals(5, out.rating());
        assertEquals("Super event", out.comment());
        assertEquals("User", out.userName());
        assertNotNull(out.createdAt());
    }

    @Test
    void addEventRating_shouldThrow_whenAlreadyRated() {
        User user = new User();
        user.setId(1);
        Event event = new Event();
        event.setEventId(10);

        EventRatingRequestDto req = new EventRatingRequestDto(1, 10, 5, "X");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(eventRatingRepository.existsByUserAndEvent(user, event)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> ratingService.addEventRating(req));
    }

    @Test
    void addEventRating_shouldThrow_whenNotParticipated() {
        User user = new User();
        user.setId(1);
        Event event = new Event();
        event.setEventId(10);

        EventRatingRequestDto req = new EventRatingRequestDto(1, 10, 5, "X");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(eventRatingRepository.existsByUserAndEvent(user, event)).thenReturn(false);
        when(userEventRepository.existsByUserAndEvent(user, event)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> ratingService.addEventRating(req));
    }

    // -------------------------------------------------------
    // getAverageUserRating
    // -------------------------------------------------------

    @Test
    void getAverageUserRating_shouldReturnValue() {
        when(userRatingRepository.getAverageUserRating(5)).thenReturn(4.5);

        Double avg = ratingService.getAverageUserRating(5);

        assertEquals(4.5, avg);
    }

    // -------------------------------------------------------
    // getRatingsByEvent
    // -------------------------------------------------------

    @Test
    void getRatingsByEvent_shouldReturnMappedDtos() {
        User user = new User();
        user.setName("Kuba");

        EventRating er = new EventRating();
        er.setEventRatingId(1);
        er.setRating(3);
        er.setComment("Ok");
        er.setUser(user);
        er.setCreatedAt(LocalDateTime.now());

        when(eventRatingRepository.findByEvent_EventId(10)).thenReturn(List.of(er));

        List<EventRatingResponseDto> out = ratingService.getRatingsByEvent(10);

        assertEquals(1, out.size());
        assertEquals(1, out.get(0).id());
        assertEquals(3, out.get(0).rating());
        assertEquals("Ok", out.get(0).comment());
        assertEquals("Kuba", out.get(0).userName());
    }

    // -------------------------------------------------------
    // updateUserRating
    // -------------------------------------------------------

    @Test
    void updateUserRating_shouldUpdate_whenOwnerMatches() {
        User rater = new User();
        rater.setId(1);
        rater.setEmail("r@e.com");
        rater.setName("Rater");
        rater.setUrlOfPicture("url");

        UserRating rating = new UserRating();
        rating.setUserRateId(10);
        rating.setRater(rater);
        rating.setRating(3);
        rating.setComment("old");
        rating.setCreatedAt(LocalDateTime.now());

        when(userRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        UserRatingRequestDto req = new UserRatingRequestDto(1, 2, 5, "new");

        UserRatingResponseDto out = ratingService.updateUserRating(10, req, 1);

        assertEquals(10, out.id());
        assertEquals(5, out.rating());
        assertEquals("new", out.comment());
        assertEquals("r@e.com", out.userEmail());

        verify(userRatingRepository).save(rating);
    }

    @Test
    void updateUserRating_shouldThrow_whenOwnerDifferent() {
        User rater = new User();
        rater.setId(1);

        UserRating rating = new UserRating();
        rating.setUserRateId(10);
        rating.setRater(rater);

        when(userRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        UserRatingRequestDto req = new UserRatingRequestDto(1, 2, 5, "new");

        assertThrows(RuntimeException.class,
                () -> ratingService.updateUserRating(10, req, 999));
    }

    // -------------------------------------------------------
    // deleteUserRating
    // -------------------------------------------------------

    @Test
    void deleteUserRating_shouldDelete_whenOwnerMatches() {
        User rater = new User();
        rater.setId(1);

        UserRating rating = new UserRating();
        rating.setUserRateId(10);
        rating.setRater(rater);

        when(userRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        ratingService.deleteUserRating(10, 1);

        verify(userRatingRepository).delete(rating);
    }

    @Test
    void deleteUserRating_shouldThrow_whenOwnerDifferent() {
        User rater = new User();
        rater.setId(1);

        UserRating rating = new UserRating();
        rating.setUserRateId(10);
        rating.setRater(rater);

        when(userRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        assertThrows(RuntimeException.class,
                () -> ratingService.deleteUserRating(10, 2));
    }

    // -------------------------------------------------------
    // updateEventRating
    // -------------------------------------------------------

    @Test
    void updateEventRating_shouldUpdate_whenOwnerMatches() {
        User user = new User();
        user.setId(5);
        user.setName("User");

        EventRating rating = new EventRating();
        rating.setEventRatingId(10);
        rating.setUser(user);
        rating.setRating(3);
        rating.setComment("old");
        rating.setCreatedAt(LocalDateTime.now());

        when(eventRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        EventRatingRequestDto req = new EventRatingRequestDto(5, 99, 4, "new");

        EventRatingResponseDto out = ratingService.updateEventRating(10, req, 5);

        assertEquals(10, out.id());
        assertEquals(4, out.rating());
        assertEquals("new", out.comment());
        assertEquals("User", out.userName());

        verify(eventRatingRepository).save(rating);
    }

    @Test
    void updateEventRating_shouldThrow_whenOwnerDifferent() {
        User user = new User();
        user.setId(5);

        EventRating rating = new EventRating();
        rating.setEventRatingId(10);
        rating.setUser(user);

        when(eventRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        EventRatingRequestDto req = new EventRatingRequestDto(5, 99, 4, "new");

        assertThrows(RuntimeException.class,
                () -> ratingService.updateEventRating(10, req, 999));
    }

    // -------------------------------------------------------
    // deleteEventRating
    // -------------------------------------------------------

    @Test
    void deleteEventRating_shouldDelete_whenOwnerMatches() {
        User user = new User();
        user.setId(5);

        EventRating rating = new EventRating();
        rating.setEventRatingId(10);
        rating.setUser(user);

        when(eventRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        ratingService.deleteEventRating(10, 5);

        verify(eventRatingRepository).delete(rating);
    }

    @Test
    void deleteEventRating_shouldThrow_whenOwnerDifferent() {
        User user = new User();
        user.setId(5);

        EventRating rating = new EventRating();
        rating.setEventRatingId(10);
        rating.setUser(user);

        when(eventRatingRepository.findById(10)).thenReturn(Optional.of(rating));

        assertThrows(RuntimeException.class,
                () -> ratingService.deleteEventRating(10, 6));
    }

    // -------------------------------------------------------
    // addOrganizerRating
    // -------------------------------------------------------

    @Test
    void addOrganizerRating_shouldSaveAndReturnDto_whenValid() {
        User rater = new User();
        rater.setId(1);
        rater.setName("Rater");
        rater.setEmail("r@e.com");
        rater.setUrlOfPicture("url");

        User organizer = new User();
        organizer.setId(2);

        Event event = new Event();
        event.setEventId(10);
        event.setEventName("Event X");

        OrganizerRatingRequestDto req =
                new OrganizerRatingRequestDto(1, 2, 10, 5, "super");

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(organizer));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(organizerRatingRepository.existsByRaterAndEvent(rater, event)).thenReturn(false);
        when(userEventRepository.existsByUserAndEvent(rater, event)).thenReturn(true);

        when(organizerRatingRepository.save(any(OrganizerRating.class))).thenAnswer(inv -> {
            OrganizerRating or = inv.getArgument(0);
            or.setId(100);
            if (or.getCreatedAt() == null) {
                or.setCreatedAt(LocalDateTime.now());
            }
            return or;
        });

        OrganizerRatingResponseDto out = ratingService.addOrganizerRating(req);

        assertEquals(100, out.id());
        assertEquals(5, out.rating());
        assertEquals("super", out.comment());
        assertEquals("Rater", out.raterName());
        assertEquals("r@e.com", out.raterEmail());
        assertEquals("url", out.raterAvatarUrl());
        assertEquals("Event X", out.eventName());
        assertEquals(10, out.eventId());
        assertEquals(1, out.raterId());

        verify(organizerRatingRepository).save(any(OrganizerRating.class));
    }

    @Test
    void addOrganizerRating_shouldThrow_whenAlreadyRated() {
        User rater = new User(); rater.setId(1);
        User organizer = new User(); organizer.setId(2);
        Event event = new Event(); event.setEventId(10);

        OrganizerRatingRequestDto req =
                new OrganizerRatingRequestDto(1, 2, 10, 5, "x");

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(organizer));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(organizerRatingRepository.existsByRaterAndEvent(rater, event)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> ratingService.addOrganizerRating(req));
    }

    @Test
    void addOrganizerRating_shouldThrow_whenNotParticipated() {
        User rater = new User(); rater.setId(1);
        User organizer = new User(); organizer.setId(2);
        Event event = new Event(); event.setEventId(10);

        OrganizerRatingRequestDto req =
                new OrganizerRatingRequestDto(1, 2, 10, 5, "x");

        when(userRepository.findById(1)).thenReturn(Optional.of(rater));
        when(userRepository.findById(2)).thenReturn(Optional.of(organizer));
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(organizerRatingRepository.existsByRaterAndEvent(rater, event)).thenReturn(false);
        when(userEventRepository.existsByUserAndEvent(rater, event)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> ratingService.addOrganizerRating(req));
    }

    // -------------------------------------------------------
    // getRatingsByOrganizer
    // -------------------------------------------------------

    @Test
    void getRatingsByOrganizer_shouldReturnDtos() {
        User organizer = new User();
        organizer.setId(2);

        User rater = new User();
        rater.setId(1);
        rater.setName("Rater");
        rater.setEmail("r@e.com");
        rater.setUrlOfPicture("u");

        Event event = new Event();
        event.setEventId(10);
        event.setEventName("Event X");

        OrganizerRating or = new OrganizerRating();
        or.setId(100);
        or.setOrganizer(organizer);
        or.setRater(rater);
        or.setRating(4);
        or.setComment("ok");
        or.setEvent(event);
        or.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(2)).thenReturn(Optional.of(organizer));
        when(organizerRatingRepository.findByOrganizer(organizer)).thenReturn(List.of(or));

        List<OrganizerRatingResponseDto> out = ratingService.getRatingsByOrganizer(2);

        assertEquals(1, out.size());
        assertEquals(100, out.get(0).id());
        assertEquals(4, out.get(0).rating());
        assertEquals("ok", out.get(0).comment());
        assertEquals("Rater", out.get(0).raterName());
        assertEquals("Event X", out.get(0).eventName());
    }

    // -------------------------------------------------------
    // getAverageOrganizerRating
    // -------------------------------------------------------

    @Test
    void getAverageOrganizerRating_shouldReturnValue() {
        when(organizerRatingRepository.getAverageOrganizerRating(2)).thenReturn(3.7);

        Double avg = ratingService.getAverageOrganizerRating(2);

        assertEquals(3.7, avg);
    }

    // -------------------------------------------------------
    // updateOrganizerRating
    // -------------------------------------------------------

    @Test
    void updateOrganizerRating_shouldUpdate_whenOwnerMatches() {
        User rater = new User();
        rater.setId(1);
        rater.setName("Rater");
        rater.setEmail("r@e.com");
        rater.setUrlOfPicture("u");

        Event event = new Event();
        event.setEventId(10);
        event.setEventName("E");

        OrganizerRating or = new OrganizerRating();
        or.setId(100);
        or.setRater(rater);
        or.setOrganizer(new User());
        or.setEvent(event);
        or.setRating(3);
        or.setComment("old");
        or.setCreatedAt(LocalDateTime.now());

        when(organizerRatingRepository.findById(100)).thenReturn(Optional.of(or));

        OrganizerRatingRequestDto req =
                new OrganizerRatingRequestDto(1, 2, 10, 5, "new");

        OrganizerRatingResponseDto out = ratingService.updateOrganizerRating(100, req, 1);

        assertEquals(100, out.id());
        assertEquals(5, out.rating());
        assertEquals("new", out.comment());
        assertEquals("r@e.com", out.raterEmail());

        verify(organizerRatingRepository).save(or);
    }

    @Test
    void updateOrganizerRating_shouldThrow_whenOwnerDifferent() {
        User rater = new User();
        rater.setId(1);

        OrganizerRating or = new OrganizerRating();
        or.setId(100);
        or.setRater(rater);

        when(organizerRatingRepository.findById(100)).thenReturn(Optional.of(or));

        OrganizerRatingRequestDto req =
                new OrganizerRatingRequestDto(1, 2, 10, 5, "x");

        assertThrows(RuntimeException.class,
                () -> ratingService.updateOrganizerRating(100, req, 999));
    }

    // -------------------------------------------------------
    // deleteOrganizerRating
    // -------------------------------------------------------

    @Test
    void deleteOrganizerRating_shouldDelete_whenOwnerMatches() {
        User rater = new User();
        rater.setId(1);

        OrganizerRating or = new OrganizerRating();
        or.setId(100);
        or.setRater(rater);

        when(organizerRatingRepository.findById(100)).thenReturn(Optional.of(or));

        ratingService.deleteOrganizerRating(100, 1);

        verify(organizerRatingRepository).delete(or);
    }

    @Test
    void deleteOrganizerRating_shouldThrow_whenOwnerDifferent() {
        User rater = new User();
        rater.setId(1);

        OrganizerRating or = new OrganizerRating();
        or.setId(100);
        or.setRater(rater);

        when(organizerRatingRepository.findById(100)).thenReturn(Optional.of(or));

        assertThrows(RuntimeException.class,
                () -> ratingService.deleteOrganizerRating(100, 2));
    }

    // -------------------------------------------------------
    // reportEventRating
    // -------------------------------------------------------

    @Test
    void reportEventRating_shouldCreateReportAndUpdateCollections() {
        User user = new User();
        user.setReportEventRatings(new java.util.HashSet<>());

        EventRating eventRating = new EventRating();
        eventRating.setReportEventRatings(new java.util.HashSet<>());

        EventRatingReportDto dto =
                new EventRatingReportDto("TOKEN", 5, "desc");

        when(userRepository.findByTokenValue("TOKEN")).thenReturn(Optional.of(user));
        when(eventRatingRepository.getReferenceById(5)).thenReturn(eventRating);

        ratingService.reportEventRating(dto);

        assertEquals(1, user.getReportEventRatings().size());
        assertEquals(1, eventRating.getReportEventRatings().size());
        verify(reportEventRatingRepository).save(any(ReportEventRating.class));
    }

    // -------------------------------------------------------
    // reportUserRating
    // -------------------------------------------------------

    @Test
    void reportUserRating_shouldSaveReport() {
        User user = new User();

        UserRating rating = new UserRating();

        UserRatingReportDto dto =
                new UserRatingReportDto("TOKEN", 10, "desc");

        when(userRepository.findByTokenValue("TOKEN")).thenReturn(Optional.of(user));
        when(userRatingRepository.getReferenceById(10)).thenReturn(rating);

        ratingService.reportUserRating(dto);

        ArgumentCaptor<ReportUserRating> captor = ArgumentCaptor.forClass(ReportUserRating.class);
        verify(reportUserRatingRepository).save(captor.capture());

        ReportUserRating saved = captor.getValue();
        assertEquals(rating, saved.getUserRating());
        assertEquals(user, saved.getUserRatingReporter());
        assertEquals("desc", saved.getDescription());
        assertFalse(saved.getActive());
        assertFalse(saved.getReviewed());
    }
}
