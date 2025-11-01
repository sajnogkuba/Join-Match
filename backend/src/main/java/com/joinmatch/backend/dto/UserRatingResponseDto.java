package com.joinmatch.backend.dto;

import java.time.LocalDateTime;

public record UserRatingResponseDto(
        Integer id,
        Integer rating,
        String comment,
        String raterName,
        LocalDateTime createdAt
) {}