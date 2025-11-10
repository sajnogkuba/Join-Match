package com.joinmatch.backend.dto.Notification;

public record TeamCancelNotificationDto(
        Integer userId,
        Integer teamId,
        String reason
) {
}
