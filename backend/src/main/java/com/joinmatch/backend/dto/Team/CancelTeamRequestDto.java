package com.joinmatch.backend.dto.Team;

public record CancelTeamRequestDto (
        Integer teamId,
        String reason
){
}
