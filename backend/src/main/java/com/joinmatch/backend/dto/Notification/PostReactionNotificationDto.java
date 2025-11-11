package com.joinmatch.backend.dto.Notification;

public record PostReactionNotificationDto(
        Integer userId,
        Integer postId,
        Integer reactionId
) {
}
