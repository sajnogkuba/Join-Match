package com.joinmatch.backend.Service;

import com.joinmatch.backend.config.CookieUtil;
import com.joinmatch.backend.dto.Event.EventDetailsResponseDto;
import com.joinmatch.backend.dto.Event.EventRequestDto;
import com.joinmatch.backend.dto.Event.EventResponseDto;
import com.joinmatch.backend.dto.Reports.EventReportDto;
import com.joinmatch.backend.enums.EventStatus;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.EventService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class EventServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private SportObjectRepository sportObjectRepository;
    @Mock private SportRepository sportRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventVisibilityRepository eventVisibilityRepository;
    @Mock private ReportEventRepository reportEventRepository;

    @InjectMocks
    private EventService eventService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    // -----------------------
    //  POMOCNICZE METODY
    // -----------------------

    private User mockUser(Integer id) {
        User u = new User();
        u.setId(id);
        u.setName("User " + id);
        return u;
    }

    private SportObject mockSportObject() {
        SportObject so = new SportObject();
        so.setObjectId(10);
        so.setName("Sport Hall");
        so.setCity("City");
        so.setStreet("Main");
        so.setNumber(5);
        so.setSecondNumber(1);
        so.setLatitude(10.0);
        so.setLongitude(20.0);
        return so;
    }

    private Sport mockSport() {
        Sport s = new Sport();
        s.setId(5);
        s.setName("Football");
        return s;
    }

    private EventVisibility mockVisibility() {
        return new EventVisibility(3, "Public");
    }

    private Event mockEvent() {
        Event e = new Event();
        e.setEventId(1);
        e.setEventName("Test Event");
        e.setNumberOfParticipants(10);
        e.setCost(BigDecimal.valueOf(20));
        e.setStatus(EventStatus.PLANNED);
        e.setScoreTeam1(1);
        e.setScoreTeam2(2);
        e.setEventDate(LocalDateTime.now());
        e.setMinLevel(3);
        e.setImageUrl("img.png");

        e.setOwner(mockUser(7));
        e.setSportObject(mockSportObject());
        e.setSportEv(mockSport());
        e.setEventVisibility(mockVisibility());
        e.setUserEvents(new ArrayList<>());

        return e;
    }

    private HttpServletRequest mockRequestWithToken(String token) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", token);
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
        return request;
    }

    // ----------------------------------------------------------------------
    //  1) getAll()
    // ----------------------------------------------------------------------

    @Test
    void getAll_shouldReturnMappedEvents() {
        Event e = mockEvent();
        Page<Event> page = new PageImpl<>(List.of(e));

        when(eventRepository.findAll(
                ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<Event>>any(),
                any(Pageable.class)
        )).thenReturn(page);

        Page<EventResponseDto> result = eventService.getAll(
                PageRequest.of(0, 10),
                "eventName",
                "ASC",
                "name",
                1,
                "City",
                LocalDateTime.now().toLocalDate(),
                LocalDateTime.now().toLocalDate(),
                false,
                true
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Event", result.getContent().get(0).eventName());
    }


    // ----------------------------------------------------------------------
    //  2) getDetailsById()
    // ----------------------------------------------------------------------

    @Test
    void getDetailsById_shouldReturnDetails() {
        Event e = mockEvent();

        when(eventRepository.findById(1)).thenReturn(Optional.of(e));

        EventDetailsResponseDto dto = eventService.getDetailsById(1);

        assertEquals(1, dto.eventId());
        assertEquals("Test Event", dto.eventName());
        assertEquals("Football", dto.sportTypeName());
        assertEquals("Sport Hall", dto.sportObjectName());
    }


    // ----------------------------------------------------------------------
    //  3) create()
    // ----------------------------------------------------------------------

    @Test
    void create_shouldSaveEvent() {
        EventRequestDto req = new EventRequestDto(
                "New Event",
                "Description",
                10,
                BigDecimal.valueOf(30),
                "owner@gmail.com",
                10,
                3,
                EventStatus.PLANNED,
                LocalDateTime.now(),
                5,
                3,
                "img.png",
                Boolean.TRUE,
                List.of()
        );

        User owner = mockUser(7);
        SportObject so = mockSportObject();
        Sport sport = mockSport();
        EventVisibility vis = mockVisibility();

        when(userRepository.findByEmail("owner@gmail.com")).thenReturn(Optional.of(owner));
        when(sportObjectRepository.findById(10)).thenReturn(Optional.of(so));
        when(eventVisibilityRepository.findById(3)).thenReturn(Optional.of(vis));
        when(sportRepository.findById(5)).thenReturn(Optional.of(sport));

        Event saved = mockEvent();
        when(eventRepository.save(any(Event.class))).thenReturn(saved);

        EventResponseDto dto = eventService.create(req);

        assertEquals("Test Event", dto.eventName());
        verify(eventRepository, times(1)).save(any(Event.class));
    }


    // ----------------------------------------------------------------------
    //  4) getEventsForUser()
    // ----------------------------------------------------------------------

    @Test
    void getEventsForUser_shouldReturnDtos() {
        Event e = mockEvent();

        when(eventRepository.findAllOwnedByUserToken("abc")).thenReturn(List.of(e));

        HttpServletRequest request = mockRequestWithToken("abc");
        List<EventResponseDto> list = eventService.getEventsForUser(request);

        assertEquals(1, list.size());
        assertEquals("Test Event", list.get(0).eventName());
    }


    // ----------------------------------------------------------------------
    //  5) getMutualEvents()
    // ----------------------------------------------------------------------

    @Test
    void getMutualEvents_shouldReturnDtos() {
        Event e = mockEvent();

        when(eventRepository.findMutualEvents(1, 2)).thenReturn(List.of(e));

        List<EventResponseDto> list = eventService.getMutualEvents(1, 2);

        assertEquals(1, list.size());
    }


    // ----------------------------------------------------------------------
    //  6) reportEvent()
    // ----------------------------------------------------------------------

    @Test
    void reportEvent_shouldSaveReport() {
        EventReportDto dto = new EventReportDto(1, "Bad event");

        User u = mockUser(5);
        when(userRepository.findByTokenValue("token123")).thenReturn(Optional.of(u));

        Event e = mockEvent();
        when(eventRepository.getReferenceById(1)).thenReturn(e);

        HttpServletRequest request = mockRequestWithToken("token123");
        eventService.reportEvent(dto, request);

        verify(reportEventRepository, times(1)).save(any(ReportEvent.class));
    }
}
