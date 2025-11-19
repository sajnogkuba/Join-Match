package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Event.EventDetailsResponseDto;
import com.joinmatch.backend.dto.Event.EventRequestDto;
import com.joinmatch.backend.dto.Event.EventResponseDto;
import com.joinmatch.backend.dto.Reports.EventReportDto;
import com.joinmatch.backend.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/event")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<Page<EventResponseDto>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer sportTypeId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Boolean free,
            @RequestParam(required = false) Boolean available
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EventResponseDto> events = eventService.getAll(
                pageable,
                sortBy,
                direction,
                name,
                sportTypeId,
                city,
                dateFrom,
                dateTo,
                free,
                available
        );

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

    @GetMapping("/byUser")
    public ResponseEntity<List<EventResponseDto>> getEventsForUser(@RequestParam String token)
    {
        return ResponseEntity.ok(eventService.getEventsForUser(token));
    }
    @GetMapping("/mutualEvents")
    public ResponseEntity<List<EventResponseDto>> getMutualEvents(@RequestParam Integer idLogUser, Integer idViewedUser){
        return ResponseEntity.ok(eventService.getMutualEvents(idLogUser,idViewedUser));
    }
    @PostMapping("/report/event")
    public ResponseEntity<Void> reportEvent(@RequestBody EventReportDto eventReportDto){
        try {
        eventService.reportEvent(eventReportDto);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

}
