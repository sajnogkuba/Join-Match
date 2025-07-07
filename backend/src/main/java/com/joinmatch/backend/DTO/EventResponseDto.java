package com.joinmatch.backend.dto;
import com.joinmatch.backend.model.Event;

import java.math.BigDecimal;

public record EventResponseDto(
        Long eventId,
        String eventName,
        Integer numberOfParticipants,
        BigDecimal cost,
        Integer ownerId,
        Integer sportObjectId,
        Integer eventVisibilityId,
        String status,
        Integer scoreTeam1,
        Integer scoreTeam2
) {
    public static EventResponseDto fromEvent(Event event) {
        return new EventResponseDto(
                event.getEventId(),
                event.getEventName(),
                event.getNumberOfParticipants(),
                event.getCost(),
                event.getOwner().getId(),
                event.getSportObject().getObjectId(),
                event.getEventVisibility().getId(),
                event.getStatus(),
                event.getScoreTeam1(),
                event.getScoreTeam2()
        );
    }
}
