package com.joinmatch.backend.dto.EventRating;

public record EventRatingRequestDto(
        Integer userId,
        Integer eventId,
        int rating,
        String comment
) {}
