package com.joinmatch.backend.dto.Notification;

public record CommentReactionNotificationDto(
        Integer postId,
        Integer commentId,
        Integer parentCommentId
) {
}
