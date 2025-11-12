package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserEvent.UserEventRequestDto;
import com.joinmatch.backend.dto.UserEvent.UserEventResponseDto;
import com.joinmatch.backend.model.AttendanceStatus;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserEvent;
import com.joinmatch.backend.repository.AttendanceStatusRepository;
import com.joinmatch.backend.repository.EventRepository;
import com.joinmatch.backend.repository.UserEventRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserEventService {
    private final UserEventRepository userEventRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AttendanceStatusRepository attendanceStatusRepository;
    private final ChatService chatService;

    public List<UserEventResponseDto> getAllUserEvent() {
        return userEventRepository.findAll()
                .stream()
                .map(UserEventResponseDto::fromUserEvent)
                .toList();
    }

    @Transactional
    public UserEventResponseDto create(UserEventRequestDto eventRequestDto) {
        UserEvent userEvent = new UserEvent();
        UserEventResponseDto response = getUserEventResponseDto(eventRequestDto, userEvent);

        User user = userRepository.findByEmail(eventRequestDto.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        chatService.addUserToEventChat(eventRequestDto.eventId(), user.getId());

        return response;
    }

    private UserEventResponseDto getUserEventResponseDto(UserEventRequestDto eventRequestDto, UserEvent userEvent) {
        User user = userRepository.findByEmail(eventRequestDto.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + eventRequestDto.userEmail() + " not found"));
        Event event = eventRepository.findById(eventRequestDto.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event with id " + eventRequestDto.eventId() + " not found"));
        AttendanceStatus attendanceStatus = attendanceStatusRepository.findById(eventRequestDto.attendanceStatusId())
                .orElseThrow(() -> new IllegalArgumentException("AttendanceStatus with id " + eventRequestDto.attendanceStatusId() + " not found"));
        userEvent.setUser(user);
        userEvent.setEvent(event);
        userEvent.setAttendanceStatus(attendanceStatus);
        UserEvent saved = userEventRepository.save(userEvent);
        return UserEventResponseDto.fromUserEvent(saved);
    }

    public List<UserEventResponseDto> getUserEventsByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + userEmail + " not found"));
        return userEventRepository.findByUserId(user.getId())
                .stream()
                .map(UserEventResponseDto::fromUserEvent)
                .toList();
    }

    public List<UserEventResponseDto> getUserEventsByEventId(Integer eventId) {
        return userEventRepository.findByEvent_EventId(eventId)
                .stream()
                .map(UserEventResponseDto::fromUserEvent)
                .toList();
    }

    @Transactional
    public void leaveEvent(String userEmail, Integer eventId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        userEventRepository.deleteByUserAndEvent(user, event);

        chatService.removeUserFromEventChat(eventId, user.getId());
    }

}
