package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventVisibilityRequestDto;
import com.joinmatch.backend.dto.EventVisibilityResponseDto;
import com.joinmatch.backend.service.EventVisibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/event-visibility")
@RequiredArgsConstructor
public class EventVisibilityController {
    private final EventVisibilityService eventVisibilityService;

    @GetMapping
    public ResponseEntity<List<EventVisibilityResponseDto>> getAllEventVisibilities() {
        List<EventVisibilityResponseDto> allEventVisibility = eventVisibilityService.findAll();
        return ResponseEntity.ok(allEventVisibility);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventVisibilityResponseDto> getEventVisibilityById(@PathVariable Integer id) {
        Optional<EventVisibilityResponseDto> eventVisibility = eventVisibilityService.findById(id);
        return eventVisibility.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventVisibility(@PathVariable Integer id) {
        eventVisibilityService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<EventVisibilityResponseDto> createEventVisibility(
            @Valid @RequestBody EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibilityResponseDto createdEventVisibility = eventVisibilityService.create(eventVisibilityRequestDto);
        return ResponseEntity.status(201).body(createdEventVisibility);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventVisibilityResponseDto> updateEventVisibility(
            @PathVariable Integer id,
            @Valid @RequestBody EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibilityResponseDto updatedEventVisibility = eventVisibilityService.update(id, eventVisibilityRequestDto);
        return ResponseEntity.ok(updatedEventVisibility);
    }
}
