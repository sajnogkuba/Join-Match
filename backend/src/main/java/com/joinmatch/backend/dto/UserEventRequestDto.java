package com.joinmatch.backend.dto;

public record UserEventRequestDto(
        String userEmail,
        Integer eventId,
        Integer attendanceStatusId
) {
}
