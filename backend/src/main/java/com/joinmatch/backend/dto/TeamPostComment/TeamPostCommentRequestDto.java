package com.joinmatch.backend.dto.TeamPostComment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TeamPostCommentRequestDto(

        @NotNull(message = "Post ID cannot be null")
        Integer postId,

        @NotNull(message = "Author ID cannot be null")
        Integer authorId,

        Integer parentCommentId,

        @NotNull(message = "Content cannot be null")
        @Size(min = 1, max = 5000, message = "Content must be between 1 and 5000 characters")
        String content
) { }

