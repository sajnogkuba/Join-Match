package com.joinmatch.backend.dto;

public record UserSavedEventRequestDto(
        String userEmail,
        Integer eventId
) {
}
