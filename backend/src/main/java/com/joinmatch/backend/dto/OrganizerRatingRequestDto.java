package com.joinmatch.backend.dto;

public record OrganizerRatingRequestDto(
        Integer raterId,
        Integer organizerId,
        Integer eventId,
        Integer rating,
        String comment
) {}
