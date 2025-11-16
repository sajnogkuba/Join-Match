package com.joinmatch.backend.dto.TeamPostCommentReaction;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TeamPostCommentReactionBatchRequestDto(
        @NotNull(message = "User ID cannot be null")
        Integer userId,
        
        @NotNull(message = "Comment IDs cannot be null")
        List<Integer> commentIds
) {}

