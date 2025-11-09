package com.joinmatch.backend.dto.EventRating;

import java.time.LocalDateTime;

public record EventRatingResponseDto(
        Integer id,
        Integer rating,
        String comment,
        String userName,
        LocalDateTime createdAt
) {}