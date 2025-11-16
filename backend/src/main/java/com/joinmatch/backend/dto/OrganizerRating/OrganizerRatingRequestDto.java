package com.joinmatch.backend.dto.OrganizerRating;

public record OrganizerRatingRequestDto(
        Integer raterId,
        Integer organizerId,
        Integer eventId,
        Integer rating,
        String comment
) {}
