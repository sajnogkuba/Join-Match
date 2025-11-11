package com.joinmatch.backend.dto.TeamPost;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.enums.PostType;
import com.joinmatch.backend.model.TeamPost;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        List<Integer> mentionedUserIds,
        Map<Integer, Integer> reactionCounts
) {

    public static TeamPostResponseDto fromEntity(TeamPost post) {
        var author = post.getAuthor();

        Map<Integer, Integer> reactionCounts = post.getReactions() != null
                ? post.getReactions().stream()
                .collect(Collectors.groupingBy(
                        r -> r.getReactionType().getId(),
                        Collectors.summingInt(r -> 1)
                ))
                : Map.of();

        return new TeamPostResponseDto(
                post.getPostId(),
                post.getTeam() != null ? post.getTeam().getId() : null,
                author != null ? author.getId() : null,
                author != null ? author.getName() : null,
                author != null ? author.getUrlOfPicture() : null,
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
                        : List.of(),
                reactionCounts
        );
    }
}
