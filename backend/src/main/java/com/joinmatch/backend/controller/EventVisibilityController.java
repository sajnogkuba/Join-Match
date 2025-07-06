package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventVisibilityRequestDto;
import com.joinmatch.backend.dto.EventVisibilityResponseDto;
import com.joinmatch.backend.service.EventVisibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-visibility")
@RequiredArgsConstructor
public class EventVisibilityController {
    private final EventVisibilityService eventVisibilityService;

    @GetMapping
    public ResponseEntity<List<EventVisibilityResponseDto>> getAllEventVisibilities() {
        List<EventVisibilityResponseDto> allEventVisibility = eventVisibilityService.getAll();
        return ResponseEntity.ok(allEventVisibility);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventVisibilityResponseDto> getEventVisibilityById(@PathVariable Integer id) {
        EventVisibilityResponseDto eventVisibility = eventVisibilityService.getById(id);
        return ResponseEntity.ok(eventVisibility);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventVisibility(@PathVariable Integer id) {
        eventVisibilityService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<EventVisibilityResponseDto> createEventVisibility(@RequestBody @Valid EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibilityResponseDto createdEventVisibility = eventVisibilityService.create(eventVisibilityRequestDto);
        return ResponseEntity.status(201).body(createdEventVisibility);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventVisibilityResponseDto> updateEventVisibility(@PathVariable Integer id, @RequestBody @Valid EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibilityResponseDto updatedEventVisibility = eventVisibilityService.update(id, eventVisibilityRequestDto);
        return ResponseEntity.ok(updatedEventVisibility);
    }
}
