package com.joinmatch.backend.dto.TeamPost;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.enums.PostType;
import com.joinmatch.backend.model.TeamPost;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record TeamPostResponseDto(
        Integer postId,
        Integer teamId,
        Integer authorId,
        String authorName,
        String authorAvatarUrl,
        PostType postType,
        String content,
        String contentHtml,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt,
        Boolean isDeleted,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime deletedAt,
        List<Integer> mentionedUserIds
) {

    public static TeamPostResponseDto fromEntity(TeamPost post) {
        return new TeamPostResponseDto(
                post.getPostId(),
                post.getTeam() != null ? post.getTeam().getId() : null,
                post.getAuthor() != null ? post.getAuthor().getId() : null,
                post.getAuthor() != null ? post.getAuthor().getName() : null,
                post.getAuthor() != null ? post.getAuthor().getUrlOfPicture() : null,
                post.getPostType(),
                post.getContent(),
                post.getContentHtml(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getIsDeleted(),
                post.getDeletedAt(),
                post.getMentions() != null
                        ? post.getMentions().stream()
                        .map(m -> m.getMentionedUser().getId())
                        .collect(Collectors.toList())
                        : List.of()
        );
    }
}
