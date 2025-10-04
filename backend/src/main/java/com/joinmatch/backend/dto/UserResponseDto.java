package com.joinmatch.backend.dto;

import jakarta.persistence.Column;

import java.time.LocalDate;

public record UserResponseDto(String name,
                              String email,

                              LocalDate dateOfBirth,

                              String urlOfPicture) {
}
