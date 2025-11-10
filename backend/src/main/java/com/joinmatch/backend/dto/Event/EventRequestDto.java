package com.joinmatch.backend.dto.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequestDto(
        String eventName,
        Integer numberOfParticipants,
        BigDecimal cost,
        String ownerEmail,
        Integer sportObjectId,
        Integer eventVisibilityId,
        String status,
        LocalDateTime eventDate,
        Integer sportTypeId,
        Integer minLevel,
        String imageUrl
) {
}
