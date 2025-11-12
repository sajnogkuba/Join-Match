package com.joinmatch.backend.dto.TeamPostMention;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.model.TeamPostMention;

import java.time.LocalDateTime;

public record TeamPostMentionResponseDto(
        Integer mentionId,
        Integer postId,
        Integer mentionedUserId,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {
    public static TeamPostMentionResponseDto fromEntity(TeamPostMention mention) {
        return new TeamPostMentionResponseDto(
                mention.getMentionId(),
                mention.getPost() != null ? mention.getPost().getPostId() : null,
                mention.getMentionedUser() != null ? mention.getMentionedUser().getId() : null,
                mention.getCreatedAt()
        );
    }
}
