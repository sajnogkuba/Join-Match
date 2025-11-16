package com.joinmatch.backend.dto.Notification;

public record CommentReplyNotificationDto(
        Integer postId,
        Integer commentId,
        Integer parentCommentId
) {
}

