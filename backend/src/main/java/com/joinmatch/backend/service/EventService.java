package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventRequestDto;
import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.dto.SportObjectRequestDto;
import com.joinmatch.backend.dto.SportObjectResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final SportObjectRepository sportObjectRepository;
    private final SportTypeRepository sportTypeRepository;
    private final UserRepository userRepository;
    private final EventVisibilityRepository eventVisibilityRepository;

    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDto::fromEvent)
                .toList();
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
        SportType sportType = sportTypeRepository.findById(eventRequestDto.sportTypeId())
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
        event.setSportType(sportType);
        event.setEventDate(eventRequestDto.eventDate());
        event.setMinLevel(eventRequestDto.minLevel());

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEvent(saved);
    }

}
