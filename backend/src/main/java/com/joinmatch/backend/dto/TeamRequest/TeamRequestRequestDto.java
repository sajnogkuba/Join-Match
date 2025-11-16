package com.joinmatch.backend.dto.TeamRequest;

import jakarta.validation.constraints.NotBlank;

public record TeamRequestRequestDto(
        @NotBlank
        Integer receiverId,

        @NotBlank
        Integer teamId
) {
}
