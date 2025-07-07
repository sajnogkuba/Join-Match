package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.repository.EventRepository;
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
}
