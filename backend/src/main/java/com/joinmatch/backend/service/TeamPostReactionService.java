package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Team.TeamResponseDto;
import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionRequestDto;
import com.joinmatch.backend.repository.TeamPostReactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TeamPostReactionService {
    private final TeamPostReactionRepository teamPostReactionRepository;

    public TeamResponseDto create(TeamPostReactionRequestDto dto) {
        return null;
    }
}
