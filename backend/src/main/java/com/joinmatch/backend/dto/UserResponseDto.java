package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.User;
import jakarta.persistence.Column;

import java.time.LocalDate;

public record UserResponseDto(
        Integer id,
        String name,
        String email,
        LocalDate dateOfBirth,
        String urlOfPicture) {
    public static UserResponseDto fromUser(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDateOfBirth(),
                user.getUrlOfPicture()
        );
    }
}
