package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Team.TeamResponseDto;
import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionRequestDto;
import com.joinmatch.backend.service.TeamPostReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reaction/team-post")
@RequiredArgsConstructor
public class TeamPostReactionController {
    private final TeamPostReactionService teamPostReactionService;

    @PostMapping
    public ResponseEntity<TeamResponseDto> create(@RequestBody TeamPostReactionRequestDto dto) {
        TeamResponseDto createdTeam = teamPostReactionService.create(dto);
        return ResponseEntity.status(201).body(createdTeam);
    }
}
