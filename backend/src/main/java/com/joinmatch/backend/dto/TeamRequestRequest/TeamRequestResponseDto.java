package com.joinmatch.backend.dto.TeamRequestRequest;

import com.joinmatch.backend.enums.TeamRequestStatus;
import com.joinmatch.backend.model.TeamRequest;

import java.time.LocalDateTime;

public record TeamRequestResponseDto(
        Integer requestId,
        Integer receiverId,
        Integer teamId,
        TeamRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TeamRequestResponseDto fromTeamRequest(TeamRequest teamRequest) {
        return new TeamRequestResponseDto(
                teamRequest.getRequestId(),
                teamRequest.getReceiver().getId(),
                teamRequest.getTeam().getId(),
                teamRequest.getStatus(),
                teamRequest.getCreatedAt(),
                teamRequest.getUpdatedAt()
        );
    }
}
