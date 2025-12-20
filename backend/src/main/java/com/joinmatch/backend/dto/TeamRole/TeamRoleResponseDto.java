package com.joinmatch.backend.dto.TeamRole;

import com.joinmatch.backend.model.TeamRole;

import java.time.LocalDateTime;

public record TeamRoleResponseDto(
        Integer id,
        String name,
        String color,
        LocalDateTime createdAt
) {
    public static TeamRoleResponseDto fromTeamRole(TeamRole teamRole) {
        return new TeamRoleResponseDto(
                teamRole.getId(),
                teamRole.getName(),
                teamRole.getColor(),
                teamRole.getCreatedAt()
        );
    }
}
