package com.joinmatch.backend.dto.UserSavedEvent;

public record UserSavedEventRequestDto(
        String userEmail,
        Integer eventId
) {
}
