package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Event.EventDetailsResponseDto;
import com.joinmatch.backend.dto.Event.EventRequestDto;
import com.joinmatch.backend.dto.Event.EventResponseDto;
import com.joinmatch.backend.dto.Reports.EventReportDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.repository.EventRepository;
import com.joinmatch.backend.specification.EventSpecificationBuilder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

        return events.map(EventResponseDto::fromEvent);
    }

    @Transactional(readOnly = true)
    public EventDetailsResponseDto getDetailsById(Integer id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event " + id + " not found"));

        return EventDetailsResponseDto.builder()
                .eventId(e.getEventId())
                .eventName(e.getEventName())
                .numberOfParticipants(e.getNumberOfParticipants())
                .bookedParticipants(e.getNumberOfParticipants())

                .cost(e.getCost())
                .currency("PLN")
                .status(e.getStatus())
                .eventDate(e.getEventDate())
                .scoreTeam1(e.getScoreTeam1())
                .scoreTeam2(e.getScoreTeam2())

                .sportTypeName(e.getSportEv().getName())
                .sportObjectName(e.getSportObject().getName())

                .sportObjectId(e.getSportObject().getObjectId())
                .city(e.getSportObject().getCity())
                .street(e.getSportObject().getStreet())
                .number(e.getSportObject().getNumber())
                .secondNumber(e.getSportObject().getSecondNumber())

                .eventVisibilityId(e.getEventVisibility().getId())
                .eventVisibilityName(e.getEventVisibility().getName())

                .ownerId(e.getOwner().getId())
                .ownerName(e.getOwner().getName())
                .ownerAvatarUrl(e.getOwner().getUrlOfPicture())

                .skillLevel("Amator")
                .paymentMethod("Gotówka")
                .imageUrl(e.getImageUrl())
                .latitude(e.getSportObject().getLatitude())
                .longitude(e.getSportObject().getLongitude())
                .build();
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
        userRepository.save(user);
        eventRepository.save(referenceById);
        reportEventRepository.save(reportEvent);
    }
}
