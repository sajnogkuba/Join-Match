package com.joinmatch.backend.dto.Team;

import com.joinmatch.backend.model.Team;

public record TeamResponseDto(
        Integer idTeam,
        String name,
        String city,
        String sportType,
        String description,
        Integer leaderId,
        String leaderName,
        String photoUrl
) {
    public static TeamResponseDto fromTeam(Team team) {
        return new TeamResponseDto(
                team.getId(),
                team.getName(),
                team.getCity(),
                team.getSportType().getName(),
                team.getDescription(),
                team.getLeader().getId(),
                team.getLeader().getName(),
                team.getPhotoUrl()
        );
    }
}
