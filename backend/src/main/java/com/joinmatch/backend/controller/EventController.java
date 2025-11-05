package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.*;
import com.joinmatch.backend.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getAllEvents() {
        List<EventResponseDto> events = eventService.getAllEvents();
        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(events);
    }
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailsResponseDto> getEventById(@PathVariable Integer id) {
        return ResponseEntity.ok(eventService.getDetailsById(id));
    }

    @PostMapping
    public ResponseEntity<EventResponseDto> createEvent(@RequestBody @Valid EventRequestDto eventRequestDto) {
        EventResponseDto createdEvent = eventService.create(eventRequestDto);
        return ResponseEntity.status(201).body(createdEvent);
    }
    @GetMapping("/page")
    public ResponseEntity<PagedEventsDto> getPage(
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return ResponseEntity.ok(eventService.getEventsPage(limit, offset));
    }
}
