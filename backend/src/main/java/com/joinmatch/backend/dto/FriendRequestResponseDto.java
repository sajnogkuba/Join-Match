package com.joinmatch.backend.dto;

import java.time.LocalDateTime;

public record FriendRequestResponseDto(
        Integer requestId,
        Integer senderId,
        Integer receiverId,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
