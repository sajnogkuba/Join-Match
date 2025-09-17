package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventDetailsResponseDto;
import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDto::fromEvent)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDetailsResponseDto getDetailsById(Long id) {
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

                .sportTypeName(e.getSportType().getName())
                .sportObjectName(e.getSportObject().getName())

                .sportObjectId(e.getSportObject().getObjectId())
                .city(e.getSportObject().getCity())
                .street(e.getSportObject().getStreet())
                .number(e.getSportObject().getNumber())
                .secondNumber(e.getSportObject().getSecondNumber())
                .capacity(e.getSportObject().getCapacity())

                .eventVisibilityId(e.getEventVisibility().getId())
                .eventVisibilityName(e.getEventVisibility().getName())

                .ownerId(e.getOwner().getId())
                .ownerName(e.getOwner().getName())

                .skillLevel("Amator")
                .paymentMethod("Gotówka")
                // .imageUrl("/assets/" + e.getEventName() + ".jpeg") // TODO
                .build();
    }


}
