package com.joinmatch.backend.dto.Notification;


public record EventInviteRequestDto(
        Integer senderId,
        String targetEmail,
        Integer eventId
) {}