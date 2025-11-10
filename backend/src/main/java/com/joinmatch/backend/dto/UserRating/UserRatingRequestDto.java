package com.joinmatch.backend.dto.UserRating;

public record UserRatingRequestDto(
        Integer raterId,
        Integer ratedId,
        int rating,
        String comment
) {}
