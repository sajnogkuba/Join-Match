package com.joinmatch.backend.dto.TeamPostReaction;


import jakarta.validation.constraints.NotNull;

public record TeamPostReactionRequestDto(

        @NotNull(message = "User ID cannot be null")
        Integer userId,

        @NotNull(message = "Post ID cannot be null")
        Integer postId,

        @NotNull(message = "Reaction type ID cannot be null")
        Integer reactionTypeId
) {}
