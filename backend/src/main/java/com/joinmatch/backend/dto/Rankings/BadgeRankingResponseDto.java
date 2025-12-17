package com.joinmatch.backend.dto.Rankings;

public record BadgeRankingResponseDto(
        Integer userId,
        String userName,
        String userEmail,
        String userAvatarUrl,
        Integer badgeCount,
        Integer position
) {}
