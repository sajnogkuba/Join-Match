package com.joinmatch.backend.dto.UserEvent;

public record UserEventRequestDto(
        String userEmail,
        Integer eventId,
        Integer attendanceStatusId
) {
}
