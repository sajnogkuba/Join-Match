package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.UserEventRequestDto;
import com.joinmatch.backend.dto.UserEventResponseDto;
import com.joinmatch.backend.dto.UserSavedEventRequestDto;
import com.joinmatch.backend.dto.UserSavedEventResponseDto;
import com.joinmatch.backend.service.UserSavedEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-saved-event")
@RequiredArgsConstructor
public class UserSavedEventController {
    private final UserSavedEventService userSavedEventService;

    @GetMapping
    public ResponseEntity<List<UserSavedEventResponseDto>> getUserSavedEvents() {
        List<UserSavedEventResponseDto> savedEvents = userSavedEventService.getAllUserSavedEvents();
        if (savedEvents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(savedEvents);
    }

    @GetMapping("/by-user-email")
    public ResponseEntity<List<UserSavedEventResponseDto>> getUserEventsByUserEmail(@RequestParam String userEmail) {
        List<UserSavedEventResponseDto> userEvents = userSavedEventService.getUserEventsByUserEmail(userEmail);
        if (userEvents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userEvents);
    }

    @PostMapping
    public ResponseEntity<UserSavedEventResponseDto> createSavedEvent(@RequestBody @Valid UserSavedEventRequestDto userSavedEventRequestDto) {
        UserSavedEventResponseDto createdUserSavedEvent = userSavedEventService.create(userSavedEventRequestDto);
        return ResponseEntity.status(201).body(createdUserSavedEvent);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteSavedEvent(@RequestBody @Valid UserSavedEventRequestDto userSavedEventRequestDto) {
        userSavedEventService.delete(userSavedEventRequestDto);
        return ResponseEntity.noContent().build();
    }
}
