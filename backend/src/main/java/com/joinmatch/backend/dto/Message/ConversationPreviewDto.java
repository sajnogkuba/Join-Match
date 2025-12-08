package com.joinmatch.backend.dto.Message;

public record ConversationPreviewDto(
        Integer id,
        String name,
        String avatarUrl,
        String lastMessage
) {}
