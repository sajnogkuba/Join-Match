package com.joinmatch.backend.dto.Notification;

public record NotificationDataDto(
        Integer senderId,
        String senderName,
        Integer requestId
) {
}

