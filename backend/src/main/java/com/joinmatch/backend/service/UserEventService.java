package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Notification.EventInviteRequestDto;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserEventService {

    private final UserEventRepository userEventRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AttendanceStatusRepository attendanceStatusRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;
    private final BadgeAwardService badgeAwardService;

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

        var responseDto = UserEventResponseDto.fromUserEvent(saved);
        badgeAwardService.evaluateBadgesForUser(user);
        return responseDto;
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
    @Transactional
    public void inviteUserToEvent(EventInviteRequestDto dto) {
        User sender = userRepository.findById(dto.senderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findByEmail(dto.targetEmail())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Event event = eventRepository.findById(dto.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        boolean alreadyParticipates = userEventRepository.findByEvent_EventIdAndUser_Id(event.getEventId(), receiver.getId()).isPresent();
        if (alreadyParticipates) {
            throw new IllegalArgumentException("Użytkownik już bierze udział w wydarzeniu");
        }

        if (sender.getId().equals(event.getOwner().getId())) {
            UserEvent userEvent = new UserEvent();
            userEvent.setUser(receiver);
            userEvent.setEvent(event);

            AttendanceStatus invitedStatus = attendanceStatusRepository.findById(5)
                    .orElseThrow(() -> new RuntimeException("Brak statusu ZAPROSZONY"));

            userEvent.setAttendanceStatus(invitedStatus);
            userEventRepository.save(userEvent);
        }

        notificationService.sendEventInvitation(receiver, sender, event);
    }
    @Transactional
    public void acceptInvitation(String userEmail, Integer eventId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        UserEvent userEvent = userEventRepository.findByEvent_EventIdAndUser_Id(eventId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Brak zaproszenia"));

        if (userEvent.getAttendanceStatus().getId() != 5) {
            throw new IllegalStateException("Nie można zaakceptować: użytkownik nie ma statusu ZAPROSZONY");
        }

        AttendanceStatus accepted = attendanceStatusRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Brak statusu ACCEPTED"));

        userEvent.setAttendanceStatus(accepted);
        userEventRepository.save(userEvent);

        chatService.addUserToEventChat(eventId, user.getId());

        notificationService.sendInvitationAcceptedNotification(event, user);
    }

    @Transactional
    public void declineInvitation(String userEmail, Integer eventId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        UserEvent userEvent = userEventRepository.findByEvent_EventIdAndUser_Id(eventId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Brak zaproszenia"));

        if (userEvent.getAttendanceStatus().getId() != 5) {
            throw new IllegalStateException("Nie można odrzucić: użytkownik nie ma statusu ZAPROSZONY");
        }

        userEventRepository.delete(userEvent);

        notificationService.sendInvitationRejectedNotification(event, user);
    }
    @Transactional
    public UserEventResponseDto requestToJoin(String userEmail, Integer eventId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        Optional<UserEvent> existingUserEvent = userEventRepository.findByEvent_EventIdAndUser_Id(eventId, user.getId());

        if (existingUserEvent.isPresent()) {
            UserEvent ue = existingUserEvent.get();
            if (ue.getAttendanceStatus().getId() == 5) {
                acceptInvitation(userEmail, eventId);
                return UserEventResponseDto.fromUserEvent(userEventRepository.findByEvent_EventIdAndUser_Id(eventId, user.getId()).get());
            }
            return UserEventResponseDto.fromUserEvent(ue);
        }

        if (event.getEventVisibility().getId() == 1) {
            return create(new UserEventRequestDto(userEmail, eventId, 1));
        }

        notificationService.sendEventJoinRequest(event, user);
        return create(new UserEventRequestDto(userEmail, eventId, 4));
    }

    @Transactional
    public void togglePaymentStatus(Integer eventId, Integer participantId, String requesterEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!event.getOwner().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("Tylko organizator może zarządzać płatnościami.");
        }

        UserEvent userEvent = userEventRepository.findByEvent_EventIdAndUser_Id(eventId, participantId)
                .orElseThrow(() -> new IllegalArgumentException("Uczestnik nie bierze udziału w tym wydarzeniu"));

        userEvent.setIsPaid(!userEvent.getIsPaid());

        userEventRepository.save(userEvent);
    }
}
