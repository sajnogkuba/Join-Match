package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.UserSavedEvent;

public record UserSavedEventResponseDto(
        Integer id,
        Integer userId,
        Long eventId
) {

    public static UserSavedEventResponseDto fromUserSavedEvent(UserSavedEvent userSavedEvent) {
        return new UserSavedEventResponseDto(
                userSavedEvent.getId(),
                userSavedEvent.getUser().getId(),
                userSavedEvent.getEvent().getEventId()
        );
    }
}