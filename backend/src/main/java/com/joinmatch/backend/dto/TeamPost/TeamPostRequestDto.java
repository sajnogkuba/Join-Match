package com.joinmatch.backend.dto.TeamPost;

import com.joinmatch.backend.enums.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TeamPostRequestDto(

        @NotNull(message = "Team ID cannot be null")
        Integer teamId,

        @NotNull(message = "Author ID cannot be null")
        Integer authorId,

        @NotBlank(message = "Content cannot be blank")
        @Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
        String content,

        String contentHtml,

        PostType postType,

        List<Integer> mentionedUserIds
) {
}
