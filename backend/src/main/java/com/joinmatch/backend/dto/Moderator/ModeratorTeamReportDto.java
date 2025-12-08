package com.joinmatch.backend.dto.Moderator;

public record ModeratorTeamReportDto(
        Integer id,
        Integer teamId,
        String teamName,
        String teamAvatarUrl,
        Integer reporterUserId,
        String reporterUserEmail,
        String reporterUsername,
        String reporterAvatarUrl,
        String description,
        boolean active,
        boolean reviewed
) {
}
