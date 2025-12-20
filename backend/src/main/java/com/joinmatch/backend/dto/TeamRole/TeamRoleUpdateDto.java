package com.joinmatch.backend.dto.TeamRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamRoleUpdateDto(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
        String name,

        String color
) {
}
