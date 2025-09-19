package com.joinmatch.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequestDto(
        String eventName,
        Integer numberOfParticipants,
        BigDecimal cost,
        Integer ownerId,
        Integer sportObjectId,
        Integer eventVisibilityId,
        String status,
        LocalDateTime eventDate,
        Integer sportTypeId
) {
}
