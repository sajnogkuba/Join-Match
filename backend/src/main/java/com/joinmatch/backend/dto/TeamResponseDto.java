package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.Team;

public record TeamResponseDto(
        Integer idTeam,
        String name,
        String city,
        String sportType,
        String description,
        String leaderName,
        String photoUrl
) {
    public static TeamResponseDto fromTeam(Team team) {
        return new TeamResponseDto(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getCity(),
                team.getSportType().getName(),
                team.getLeader().getName(),
                team.getPhotoUrl()
        );
    }
}
