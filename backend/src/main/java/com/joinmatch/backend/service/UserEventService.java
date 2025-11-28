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
    private final NotificationService notificationService;

    public List<UserEventResponseDto> getAllUserEvent() {
        return userEventRepository.findAll()
                .stream()
                .map(UserEventResponseDto::fromUserEvent)
                .toList();
    }

    @Transactional
    public UserEventResponseDto create(UserEventRequestDto dto) {

        User user = userRepository.findByEmail(dto.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(dto.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        AttendanceStatus status = attendanceStatusRepository.findById(dto.attendanceStatusId())
                .orElseThrow(() -> new IllegalArgumentException("Status not found"));

        UserEvent userEvent = new UserEvent();
        userEvent.setUser(user);
        userEvent.setEvent(event);
        userEvent.setAttendanceStatus(status);

        UserEvent saved = userEventRepository.save(userEvent);

        if (status.getId() == 1) {
            chatService.addUserToEventChat(event.getEventId(), user.getId());
            notificationService.sendEventPublicJoined(event, user);
        }

        return UserEventResponseDto.fromUserEvent(saved);
    }

    @Transactional
    public UserEventResponseDto requestToJoin(String userEmail, Integer eventId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (event.getEventVisibility().getId() == 1) {
            return create(new UserEventRequestDto(userEmail, eventId, 1));
        }

        notificationService.sendEventJoinRequest(event, user);

        return create(new UserEventRequestDto(userEmail, eventId, 4));
    }

    @Transactional
    public void approveUser(Integer eventId, Integer userId) {

        UserEvent ue = userEventRepository
                .findByEvent_EventIdAndUser_Id(eventId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Relacja nie znaleziona"));

        Event event = ue.getEvent();
        User user = ue.getUser();

        AttendanceStatus accepted = attendanceStatusRepository.findById(1)
                .orElseThrow();

        ue.setAttendanceStatus(accepted);
        userEventRepository.save(ue);

        chatService.addUserToEventChat(eventId, userId);

        notificationService.sendEventJoinAccepted(user, event);
    }

    @Transactional
    public void rejectUser(Integer eventId, Integer userId) {

        UserEvent ue = userEventRepository
                .findByEvent_EventIdAndUser_Id(eventId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Relacja nie znaleziona"));

        Event event = ue.getEvent();
        User user = ue.getUser();

        AttendanceStatus rejected = attendanceStatusRepository.findById(3)
                .orElseThrow();

        ue.setAttendanceStatus(rejected);
        userEventRepository.save(ue);

        notificationService.sendEventJoinRejected(user, event);
    }

    public List<UserEventResponseDto> getUserEventsByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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
