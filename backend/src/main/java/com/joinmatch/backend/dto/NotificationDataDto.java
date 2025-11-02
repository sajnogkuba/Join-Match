package com.joinmatch.backend.dto;

public record NotificationDataDto(
        Integer senderId,
        String senderName,
        Integer requestId
) {
}

