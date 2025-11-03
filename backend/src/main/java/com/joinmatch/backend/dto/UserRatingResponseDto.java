package com.joinmatch.backend.dto;

import java.time.LocalDateTime;

public record UserRatingResponseDto(
        Integer id,

        String userEmail,
        Integer rating,
        String comment,
        String raterName,
        LocalDateTime createdAt,
        String raterAvatarUrl
) {}