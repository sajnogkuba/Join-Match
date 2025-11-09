package com.joinmatch.backend.dto.Notification;

import com.joinmatch.backend.enums.NotificationType;
import com.joinmatch.backend.model.Notification;

import java.time.LocalDateTime;

public record NotificationResponseDto(
        Integer id,
        NotificationType type,
        String title,
        String message,
        String data,
        Boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationResponseDto fromNotification(Notification notification) {
        return new NotificationResponseDto(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getData(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
