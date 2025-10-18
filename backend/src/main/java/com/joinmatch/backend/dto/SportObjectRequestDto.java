package com.joinmatch.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SportObjectRequestDto(

        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 50 characters")
        String name,

        @NotBlank(message = "City cannot be blank")
        @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
        String city,

        @NotBlank(message = "Street cannot be blank")
        @Size(min = 2, max = 100, message = "Street must be between 2 and 50 characters")
        String street,

        @Min(value = 1, message = "Number must be greater than 0")
        @NotNull(message = "Number cannot be null")
        Integer number,

        @Min(value = 1, message = "Second number must be greater than 0")
        @NotNull(message = "Second number cannot be null")
        Integer secondNumber,

        @Min(value = 1, message = "Capacity must be greater than 0")
        @NotNull(message = "Capacity cannot be null")
        Integer capacity,

        Double latitude,

        Double longitude
){
}
