package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventDetailsResponseDto;
import com.joinmatch.backend.dto.EventRequestDto;
import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final SportObjectRepository sportObjectRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;
    private final EventVisibilityRepository eventVisibilityRepository;

    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDto::fromEvent)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDetailsResponseDto getDetailsById(Integer id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event " + id + " not found"));

        return EventDetailsResponseDto.builder()
                .eventId(e.getEventId())
                .eventName(e.getEventName())
                .numberOfParticipants(e.getNumberOfParticipants())
                // .bookedParticipants(0) // TODO

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

                .skillLevel("Amator")
                .paymentMethod("Gotówka")
                .imageUrl(e.getImageUrl())
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

}
