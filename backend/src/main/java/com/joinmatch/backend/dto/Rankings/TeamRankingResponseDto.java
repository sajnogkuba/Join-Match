package com.joinmatch.backend.dto.Rankings;

public record TeamRankingResponseDto(
        Integer teamId,
        String teamName,
        String teamCity,
        String teamPhotoUrl,
        Integer leaderId,
        String leaderName,
        String leaderEmail,
        String leaderAvatarUrl,
        Integer memberCount,
        Integer position
) {}
