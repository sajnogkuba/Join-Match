package com.joinmatch.backend.dto.EventTeam;

public record EventTeamResponseDto( Integer teamId,
                                    String name,
                                    String city,
                                    String photoUrl,
                                    Integer leaderId,
                                    String leaderName) {
}
