package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventDetailsResponseDto;
import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<EventDetailsResponseDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getDetailsById(id));
    }

//    @GetMapping("/{id}/participants")
//    public ResponseEntity<List<ParticipantResponseDto>> getParticipants(@PathVariable Long id) {
//        return ResponseEntity.ok(eventService.getParticipants(id));
//    }

}
