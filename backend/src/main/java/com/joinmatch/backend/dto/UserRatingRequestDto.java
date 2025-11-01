package com.joinmatch.backend.dto;

public record UserRatingRequestDto(
        Integer raterId,
        Integer ratedId,
        int rating,
        String comment
) {}
