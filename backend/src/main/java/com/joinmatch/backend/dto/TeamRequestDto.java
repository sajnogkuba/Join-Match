package com.joinmatch.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamRequestDto(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "City cannot be blank")
        @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
        String city,

        @NotBlank
        Integer sportTypeId,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        @NotBlank
        Integer leaderId,

        String photoUrl
) {
}
