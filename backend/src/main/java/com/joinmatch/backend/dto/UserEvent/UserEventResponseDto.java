package com.joinmatch.backend.dto.UserEvent;

import com.joinmatch.backend.model.Sport;
import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.model.UserEvent;

import java.time.LocalDateTime;
import java.util.Optional;

public record UserEventResponseDto(
        Integer id,
        Integer userId,
        String userEmail,
        String userName,
        String userAvatarUrl,
        String attendanceStatusName,
        Integer eventId,
        String eventName,
        Boolean isPaid,
        Integer sportRating,
        LocalDateTime eventDate
) {
    public static UserEventResponseDto fromUserEvent(UserEvent userEvent) {
        var user = userEvent.getUser();
        var event = userEvent.getEvent();
        Sport sport = event.getSportEv();
        Integer sportRating = null;
        Optional<SportUser> first = user.getSportUsers()
                .stream()
                .filter(sportUser -> sportUser.getSport().equals(sport))
                .findFirst();
        if (first.isPresent()) {
            sportRating = first.get().getRating();
        }

        return new UserEventResponseDto(
                userEvent.getId(),
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getUrlOfPicture(),
                userEvent.getAttendanceStatus().getName(),
                event.getEventId(),
                event.getEventName(),
                userEvent.getIsPaid(),
                sportRating,
                event.getEventDate()
        );
    }
}
