package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.UserEvent;

public record UserEventResponseDto(
        Integer id,
        String userEmail,
        String eventName,
        String attendanceStatusName
) {
    public static UserEventResponseDto fromUserEvent(UserEvent userEvent) {
        return new UserEventResponseDto(
                userEvent.getId(),
                userEvent.getUser().getEmail(),
                userEvent.getEvent().getEventName(),
                userEvent.getAttendanceStatus().getName()
        );
    }
}
