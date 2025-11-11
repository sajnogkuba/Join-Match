package com.joinmatch.backend.dto.TeamPostCommentReaction;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.joinmatch.backend.dto.ReactionType.ReactionTypeResponseDto;
import com.joinmatch.backend.model.TeamPostCommentReaction;

import java.time.LocalDateTime;

public record TeamPostCommentReactionResponseDto(
        Integer id,
        Integer userId,
        String userName,
        String userAvatarUrl,
        Integer commentId,
        ReactionTypeResponseDto reactionType,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {

    public static TeamPostCommentReactionResponseDto fromEntity(TeamPostCommentReaction reaction) {
        return new TeamPostCommentReactionResponseDto(
                reaction.getId(),
                reaction.getUser() != null ? reaction.getUser().getId() : null,
                reaction.getUser() != null ? reaction.getUser().getName() : null,
                reaction.getUser() != null ? reaction.getUser().getUrlOfPicture() : null,
                reaction.getComment() != null ? reaction.getComment().getCommentId() : null,
                reaction.getReactionType() != null ? ReactionTypeResponseDto.fromEntity(reaction.getReactionType()) : null,
                reaction.getCreatedAt()
        );
    }
}
