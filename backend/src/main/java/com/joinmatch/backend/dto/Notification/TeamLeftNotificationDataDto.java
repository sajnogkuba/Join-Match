package com.joinmatch.backend.dto.Notification;

public record TeamLeftNotificationDataDto(
        Integer leaderId,
        Integer teamId,
        Integer userId
) {
}
