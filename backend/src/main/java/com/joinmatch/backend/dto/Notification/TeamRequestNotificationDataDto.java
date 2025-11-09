package com.joinmatch.backend.dto.Notification;

public record TeamRequestNotificationDataDto(
        Integer senderId,
        Integer teamId,
        Integer teamRequestId
) {
}
