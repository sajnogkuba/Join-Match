package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.UserEventRequestDto;
import com.joinmatch.backend.dto.UserEventResponseDto;
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
}
