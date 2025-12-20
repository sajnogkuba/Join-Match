package com.joinmatch.backend.dto.Rankings;

public record EventRankingResponseDto(
        Integer eventId,
        String eventName,
        String eventImageUrl,
        String eventCity,
        String sportTypeName,
        Integer ownerId,
        String ownerName,
        String ownerEmail,
        String ownerAvatarUrl,
        Double averageRating,
        Integer totalRatings,
        Integer participantCount,
        Integer position
) {}
