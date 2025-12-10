package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.TokenExtractor;
import com.joinmatch.backend.dto.Notification.EventInviteRequestDto;
import com.joinmatch.backend.dto.UserEvent.UserEventRequestDto;
import com.joinmatch.backend.dto.UserEvent.UserEventResponseDto;
import org.springframework.data.domain.Page;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.EventService;
import com.joinmatch.backend.service.NotificationService;
import com.joinmatch.backend.service.UserEventService;
import com.joinmatch.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-event")
@RequiredArgsConstructor
public class UserEventController {
    private final UserEventService userEventService;
    private final UserService userService;
    private final EventService eventService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserEventResponseDto>> getAllUserEvents() {
        List<UserEventResponseDto> userEvents = userEventService.getAllUserEvent();
        if (userEvents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userEvents);
    }

    @GetMapping("/by-user-email")
    public ResponseEntity<Page<UserEventResponseDto>> getUserEventsByUserEmail(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam String userEmail
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserEventResponseDto> userEvents = userEventService.getUserEventsByUserEmail(
                pageable,
                sortBy,
                direction,
                userEmail);

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

    @PostMapping("/request")
    public ResponseEntity<UserEventResponseDto> requestJoin(
            @RequestBody UserEventRequestDto dto) {
        return ResponseEntity.ok(
                userEventService.requestToJoin(dto.userEmail(), dto.eventId())
        );
    }

    @PostMapping("/{eventId}/approve")
    public ResponseEntity<Void> approveUser(
            @PathVariable Integer eventId,
            @RequestParam Integer userId) {
        userEventService.approveUser(eventId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/reject")
    public ResponseEntity<Void> rejectUser(
            @PathVariable Integer eventId,
            @RequestParam Integer userId) {
        userEventService.rejectUser(eventId, userId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/invite")
    public ResponseEntity<Void> inviteUserToEvent(@RequestBody EventInviteRequestDto dto) {
        userEventService.inviteUserToEvent(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invitation/accept")
    public ResponseEntity<Void> acceptInvitation(@RequestBody UserEventRequestDto dto) {
        userEventService.acceptInvitation(dto.userEmail(), dto.eventId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invitation/decline")
    public ResponseEntity<Void> declineInvitation(@RequestBody UserEventRequestDto dto) {
        userEventService.declineInvitation(dto.userEmail(), dto.eventId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{eventId}/participant/{userId}/payment")
    public ResponseEntity<Void> togglePaymentStatus(
            @PathVariable Integer eventId,
            @PathVariable Integer userId,
            HttpServletRequest request
    ) {
        String token = TokenExtractor.extractToken(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User requester = userRepository.findByTokenValue(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        userEventService.togglePaymentStatus(eventId, userId, requester.getEmail());

        return ResponseEntity.ok().build();
    }

}
