package com.joinmatch.backend.dto.Rankings;

public record UserRankingResponseDto(
        Integer userId,
        String userName,
        String userEmail,
        String userAvatarUrl,
        Double averageRating,
        Integer totalRatings,
        Integer position
) {}
