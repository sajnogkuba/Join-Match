package com.joinmatch.backend.dto.UserEvent;

import com.joinmatch.backend.model.UserEvent;

public record UserEventResponseDto(
        Integer id,
        Integer userId,
        String userEmail,
        String userName,
        String userAvatarUrl,
        String attendanceStatusName,
        Integer eventId,
        String eventName,
        Boolean isPaid
) {
    public static UserEventResponseDto fromUserEvent(UserEvent userEvent) {
        var user = userEvent.getUser();
        var event = userEvent.getEvent();

        return new UserEventResponseDto(
                userEvent.getId(),
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getUrlOfPicture(),
                userEvent.getAttendanceStatus().getName(),
                event.getEventId(),
                event.getEventName(),
                userEvent.getIsPaid()
        );
    }
}
