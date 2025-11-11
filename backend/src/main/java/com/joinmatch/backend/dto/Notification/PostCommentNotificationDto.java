package com.joinmatch.backend.dto.Notification;

public record PostCommentNotificationDto(
        Integer userId,
        Integer postId,
        Integer commentId
) {
}
