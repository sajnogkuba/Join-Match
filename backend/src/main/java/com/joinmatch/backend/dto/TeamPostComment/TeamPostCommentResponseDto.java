package com.joinmatch.backend.dto.TeamPostComment;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.model.TeamPostComment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record TeamPostCommentResponseDto(
        Integer commentId,
        Integer postId,
        Integer authorId,
        String authorName,
        String authorAvatarUrl,
        Integer parentCommentId,
        String content,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt,
        Boolean isDeleted,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime deletedAt,
        List<Integer> replyIds
) {

    public static TeamPostCommentResponseDto fromEntity(TeamPostComment comment) {
        var author = comment.getAuthor();

        return new TeamPostCommentResponseDto(
                comment.getCommentId(),
                comment.getPost() != null ? comment.getPost().getPostId() : null,
                author != null ? author.getId() : null,
                author != null ? author.getName() : null,
                author != null ? author.getUrlOfPicture() : null,
                comment.getParentComment() != null ? comment.getParentComment().getCommentId() : null,
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getIsDeleted(),
                comment.getDeletedAt(),
                comment.getReplies() != null
                        ? comment.getReplies().stream()
                        .map(TeamPostComment::getCommentId)
                        .collect(Collectors.toList())
                        : List.of()
        );
    }
}
