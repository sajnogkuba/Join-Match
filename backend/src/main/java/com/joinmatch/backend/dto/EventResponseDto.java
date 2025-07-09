package com.joinmatch.backend.dto;
import com.joinmatch.backend.model.Event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventResponseDto(
        Long eventId,
        String eventName,
        Integer numberOfParticipants,
        BigDecimal cost,
        Integer ownerId,
        String sportObjectName,
        Integer eventVisibilityId,
        String status,
        Integer scoreTeam1,
        Integer scoreTeam2,
        LocalDateTime eventDate,
        String sportTypeName,
        Integer bookedParticipants
) {
    public static EventResponseDto fromEvent(Event event) {
        return new EventResponseDto(
                event.getEventId(),
                event.getEventName(),
                event.getNumberOfParticipants(),
                event.getCost(),
                event.getOwner().getId(),
                event.getSportObject().getName(),
                event.getEventVisibility().getId(),
                event.getStatus(),
                event.getScoreTeam1(),
                event.getScoreTeam2(),
                event.getEventDate(),
                event.getSportType().getName(),
                0
        );
    }
}
