package com.joinmatch.backend.dto.TeamPostMention;


import jakarta.validation.constraints.NotNull;

public record TeamPostMentionRequestDto(

        @NotNull(message = "Post ID cannot be null")
        Integer postId,

        @NotNull(message = "Mentioned user ID cannot be null")
        Integer mentionedUserId
) { }
