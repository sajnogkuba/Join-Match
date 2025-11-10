package com.joinmatch.backend.dto.UserTeam;

import com.joinmatch.backend.model.UserTeam;

import java.time.LocalDateTime;

public record UserTeamResponseDto (
        Integer id,
        Integer userId,
        String userName,
        String userEmail,
        String userAvatarUrl,
        LocalDateTime joinedAt
){
    public static UserTeamResponseDto fromUserTeam(UserTeam userTeam) {
        return new UserTeamResponseDto(
                userTeam.getId(),
                userTeam.getUser().getId(),
                userTeam.getUser().getName(),
                userTeam.getUser().getEmail(),
                userTeam.getUser().getUrlOfPicture(),
                userTeam.getCreatedAt()
        );
    }
}
