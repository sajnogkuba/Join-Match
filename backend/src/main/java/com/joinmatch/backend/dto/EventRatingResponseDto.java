package com.joinmatch.backend.dto;

import java.time.LocalDateTime;

public record EventRatingResponseDto(
        Integer id,
        Integer rating,
        String comment,
        String userName,
        LocalDateTime createdAt
) {}