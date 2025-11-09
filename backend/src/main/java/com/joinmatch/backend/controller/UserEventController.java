package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.UserEvent.UserEventRequestDto;
import com.joinmatch.backend.dto.UserEvent.UserEventResponseDto;
import com.joinmatch.backend.service.UserEventService;
import com.joinmatch.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-event")
@RequiredArgsConstructor
public class UserEventController {
    private final UserEventService userEventService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserEventResponseDto>> getAllUserEvents() {
        List<UserEventResponseDto> userEvents = userEventService.getAllUserEvent();
        if (userEvents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userEvents);
    }

    @GetMapping("/by-user-email")
    public ResponseEntity<List<UserEventResponseDto>> getUserEventsByUserEmail(@RequestParam String userEmail) {
        List<UserEventResponseDto> userEvents = userEventService.getUserEventsByUserEmail(userEmail);
        if (userEvents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userEvents);
    }

    @PostMapping
    public ResponseEntity<UserEventResponseDto> createEvent(@RequestBody @Valid UserEventRequestDto userEventRequestDto) {
        UserEventResponseDto createdUserEvent = userEventService.create(userEventRequestDto);
        return ResponseEntity.status(201).body(createdUserEvent);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<UserEventResponseDto>> getParticipants(@PathVariable Integer id) {
        List<UserEventResponseDto> participants = userEventService.getUserEventsByEventId(id);
        return ResponseEntity.ok(participants);
    }

    @DeleteMapping
    public ResponseEntity<Void> leaveEvent(@RequestBody UserEventRequestDto dto) {
        userEventService.leaveEvent(dto.userEmail(), dto.eventId());
        return ResponseEntity.noContent().build();
    }

}
