package com.joinmatch.backend.dto.TeamPostCommentReaction;

import jakarta.validation.constraints.NotNull;

public record TeamPostCommentReactionRequestDto(

        @NotNull(message = "User ID cannot be null")
        Integer userId,

        @NotNull(message = "Comment ID cannot be null")
        Integer commentId,

        @NotNull(message = "Reaction type ID cannot be null")
        Integer reactionTypeId
) {}
