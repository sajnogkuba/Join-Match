package com.joinmatch.backend.dto.UserTeam;

import com.joinmatch.backend.model.UserTeam;

import java.time.LocalDateTime;

public record UserTeamResponseDto (
        Integer id,
        Integer userId,
        String userName,
        String userEmail,
        String userAvatarUrl,
        LocalDateTime joinedAt,
        Integer roleId,
        String roleName
){
    public static UserTeamResponseDto fromUserTeam(UserTeam userTeam) {
        Integer roleId = null;
        String roleName = null;
        
        if (userTeam.getRole() != null) {
            roleId = userTeam.getRole().getId();
            roleName = userTeam.getRole().getName();
        }
        
        return new UserTeamResponseDto(
                userTeam.getId(),
                userTeam.getUser().getId(),
                userTeam.getUser().getName(),
                userTeam.getUser().getEmail(),
                userTeam.getUser().getUrlOfPicture(),
                userTeam.getCreatedAt(),
                roleId,
                roleName
        );
    }
}
