package com.joinmatch.backend.dto.Team;

import com.joinmatch.backend.model.Team;

import java.time.LocalDateTime;

public record TeamDetailsDto(
        Integer idTeam,
        String name,
        String city,
        String sportType,
        String description,
        Integer leaderId,
        String leaderName,
        String leaderAvatarUrl,
        String photoUrl,
        Integer memberCount,
        LocalDateTime createdAt
) {
    public static TeamDetailsDto fromTeam(Team team) {
        return new TeamDetailsDto(
                team.getId(),
                team.getName(),
                team.getCity(),
                team.getSportType().getName(),
                team.getDescription(),
                team.getLeader().getId(),
                team.getLeader().getName(),
                team.getLeader().getUrlOfPicture(),
                team.getPhotoUrl(),
                0, // Assuming member count is not directly available in Team entity
                team.getCreatedAt()
        );
    }
}
