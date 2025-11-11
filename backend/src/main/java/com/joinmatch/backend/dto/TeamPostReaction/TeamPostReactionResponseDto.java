package com.joinmatch.backend.dto.TeamPostReaction;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.dto.ReactionType.ReactionTypeResponseDto;
import com.joinmatch.backend.model.TeamPostReaction;

import java.time.LocalDateTime;

public record TeamPostReactionResponseDto(
        Integer id,
        Integer userId,
        Integer postId,
        ReactionTypeResponseDto reactionType,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {

    public static TeamPostReactionResponseDto fromEntity(TeamPostReaction reaction) {
        return new TeamPostReactionResponseDto(
                reaction.getId(),
                reaction.getUser() != null ? reaction.getUser().getId() : null,
                reaction.getPost() != null ? reaction.getPost().getPostId() : null,
                reaction.getReactionType() != null ? ReactionTypeResponseDto.fromEntity(reaction.getReactionType()) : null,
                reaction.getCreatedAt()
        );
    }
}
