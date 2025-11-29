package com.joinmatch.backend.dto.Notification;

public record EventNotificationDataDto(
        Integer eventId,
        String eventName,
        Integer userId,
        String userName
) {}
