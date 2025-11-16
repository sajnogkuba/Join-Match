package com.joinmatch.backend.dto.OrganizerRating;

import java.time.LocalDateTime;

public record OrganizerRatingResponseDto(
        Integer id,
        Integer rating,
        String comment,
        String raterName,
        String raterEmail,
        String raterAvatarUrl,
        LocalDateTime createdAt,
        String eventName,
        Integer eventId,
        Integer raterId
) {}
