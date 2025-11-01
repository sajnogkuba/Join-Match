package com.joinmatch.backend.dto;

public record EventRatingRequestDto(
        Integer userId,
        Integer eventId,
        int rating,
        String comment
) {}
