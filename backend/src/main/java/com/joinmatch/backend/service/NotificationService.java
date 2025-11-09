package com.joinmatch.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joinmatch.backend.dto.Notification.NotificationDataDto;
import com.joinmatch.backend.dto.Notification.NotificationResponseDto;
import com.joinmatch.backend.enums.NotificationType;
import com.joinmatch.backend.model.Notification;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public void sendFriendRequestNotification(User receiver, User sender, Integer requestId) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    requestId
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST)
                    .title("Nowe zaproszenie do znajomych")
                    .message(sender.getName() + " wysłał Ci zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    @Transactional
    public void sendFriendRequestAcceptedNotification(User receiver, User sender) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    null // Brak requestId dla zaakceptowanego zaproszenia
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST_ACCEPTED)
                    .title("Zaproszenie zaakceptowane")
                    .message(sender.getName() + " zaakceptował Twoje zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    @Transactional
    public void sendFriendRequestRejectedNotification(User receiver, User sender) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    null // Brak requestId dla odrzuconego zaproszenia
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST_REJECTED)
                    .title("Zaproszenie odrzucone")
                    .message(sender.getName() + " odrzucił Twoje zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public List<NotificationResponseDto> getUserNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDto::fromNotification)
                .toList();
    }

    public Long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }
}
