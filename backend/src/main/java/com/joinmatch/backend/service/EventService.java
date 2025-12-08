package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Event.EventDetailsResponseDto;
import com.joinmatch.backend.dto.Event.EventRequestDto;
import com.joinmatch.backend.dto.Event.EventResponseDto;
import com.joinmatch.backend.dto.Reports.EventReportDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.repository.EventRepository;
import com.joinmatch.backend.specification.EventSpecificationBuilder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.transaction.annotation.Transactional;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final SportObjectRepository sportObjectRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;
    private final EventVisibilityRepository eventVisibilityRepository;
    private final ReportEventRepository reportEventRepository;

    private String mapSkillLevelToString(Integer level) {
        if (level == null) return "Nieokreślony";
        return switch (level) {
            case 1 -> "Amator";
            case 2 -> "Rekreacyjny";
            case 3 -> "Średniozaawansowany";
            case 4 -> "Zaawansowany";
            case 5 -> "Profesjonalista";
            default -> "Inny (" + level + ")";
        };
    }

    public Page<EventResponseDto> getAll(
            Pageable pageable,
            String sortBy,
            String direction,
            String name,
            Integer sportTypeId,
            String city,
            LocalDate dateFrom,
            LocalDate dateTo,
            Boolean free,
            Boolean available
    ) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Specification<Event> spec = EventSpecificationBuilder.build(
                name,
                sportTypeId,
                city,
                dateFrom,
                dateTo,
                free,
                available
        );

        Page<Event> events = eventRepository.findAll(spec, sortedPageable);

        List<Event> filtered = events.getContent().stream()
                .filter(event -> event.getReportEvents()
                        .stream()
                        .noneMatch(reportEvent -> Boolean.TRUE.equals(reportEvent.getActive())))
                .toList();

        Page<Event> filteredPage = new PageImpl<>(
                filtered,
                sortedPageable,
                filtered.size()
        );

        return filteredPage.map(EventResponseDto::fromEvent);
    }

    @Transactional(readOnly = true)
    public EventDetailsResponseDto getDetailsById(Integer id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event " + id + " not found"));

        return new EventDetailsResponseDto(
                e.getEventId(),
                e.getEventName(),
                e.getNumberOfParticipants(),
                e.getNumberOfParticipants(), // bookedParticipants

                e.getCost(),
                "PLN",
                e.getStatus(),
                e.getEventDate(),
                e.getScoreTeam1(),
                e.getScoreTeam2(),

                e.getSportEv().getName(),
                e.getSportObject().getName(),

                e.getSportObject().getObjectId(),
                e.getSportObject().getCity(),
                e.getSportObject().getStreet(),
                e.getSportObject().getNumber(),
                e.getSportObject().getSecondNumber(),

                e.getEventVisibility().getId(),
                e.getEventVisibility().getName(),

                e.getOwner().getId(),
                e.getOwner().getName(),
                e.getOwner().getUrlOfPicture(),

                "Amator",
                "Gotówka",
                e.getImageUrl(),

                e.getSportObject().getLatitude(),
                e.getSportObject().getLongitude()
        );
    }



        @Transactional
    public EventResponseDto create(EventRequestDto eventRequestDto) {
        Event event = new Event();
        return getEventResponseDto(eventRequestDto, event);
    }

    private EventResponseDto getEventResponseDto(EventRequestDto eventRequestDto, Event event) {
        User owner = userRepository.findByEmail(eventRequestDto.ownerEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + eventRequestDto.ownerEmail() + " not found"));
        SportObject sportObject = sportObjectRepository.findById(eventRequestDto.sportObjectId())
                .orElseThrow(() -> new IllegalArgumentException("SportObject with id " + eventRequestDto.sportObjectId() + " not found"));
        Sport sport = sportRepository.findById(eventRequestDto.sportTypeId())
                .orElseThrow(() -> new IllegalArgumentException("SportType with id " + eventRequestDto.sportTypeId() + " not found"));
        EventVisibility eventVisibility = eventVisibilityRepository.findById(eventRequestDto.eventVisibilityId())
                .orElseThrow(() -> new IllegalArgumentException("EventVisibility with id " + eventRequestDto.eventVisibilityId() + " not found"));
        event.setEventName(eventRequestDto.eventName());
        event.setDescription(eventRequestDto.description());
        event.setNumberOfParticipants(eventRequestDto.numberOfParticipants());
        event.setCost(eventRequestDto.cost());
        event.setOwner(owner);
        event.setSportObject(sportObject);
        event.setEventVisibility(eventVisibility);
        event.setStatus(eventRequestDto.status());
        event.setSportEv(sport);
        event.setEventDate(eventRequestDto.eventDate());
        event.setMinLevel(eventRequestDto.minLevel());
        event.setImageUrl(eventRequestDto.imageUrl());
        event.setPaymentMethods(eventRequestDto.paymentMethods());

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEvent(saved);
    }

    public List<EventResponseDto> getEventsForUser(String token){
        return eventRepository.findAllOwnedByUserToken(token)
                .stream()
                .map(EventResponseDto::fromEvent)
                .toList();
    }
    public List<EventResponseDto> getMutualEvents(Integer idLoggedUser, Integer idViewedUser){
        return eventRepository.findMutualEvents(idLoggedUser,idViewedUser)
                .stream()
                .map(EventResponseDto::fromEvent)
                .toList();
    }
    @Transactional
    public void reportEvent(EventReportDto eventReportDto){
        User user = userRepository.findByTokenValue(eventReportDto.token()).orElseThrow(() -> new IllegalArgumentException("Not foung user"));
        Event referenceById = eventRepository.getReferenceById(eventReportDto.idEvent());
        ReportEvent reportEvent = new ReportEvent();
        reportEvent.setReportedEvent(referenceById);
        reportEvent.setReporterUser(user);
        reportEvent.setReviewed(false);
        reportEvent.setActive(false);
        reportEvent.setDescription(eventReportDto.description());
        user.getReportEvents().add(reportEvent);
        referenceById.getReportEvents().add(reportEvent);
//        userRepository.save(user);
//        eventRepository.save(referenceById);
        reportEventRepository.save(reportEvent);
    }

    public Page<EventResponseDto> getParticipatedEvents(Pageable pageable, String sortBy, String direction, String token) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        var user = userRepository.findByTokenValue(token)
                .orElseThrow(() -> new IllegalArgumentException("User with token " + token + " not found"));
        Page<Event> events = eventRepository.findAllParticipatedByUserId(user.getId(), sortedPageable);
        return events.map(EventResponseDto::fromEvent);
    }
    public Event findById(Integer id){
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event with id " + id + " not found"));
    }
}
