package com.joinmatch.backend.dto.Message;

import java.time.LocalDateTime;

public record ChatMessageDto(

        Integer messageId,
        Integer conversationId,
        Integer senderId,
        String senderName,
        String senderAvatarUrl,
        String content,
        LocalDateTime createdAt,
        String conversationType,
        Integer teamId,
        Integer eventId
) {}

