package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamRequestDto;
import com.joinmatch.backend.dto.TeamResponseDto;
import com.joinmatch.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamResponseDto> createTeam(@RequestBody TeamRequestDto teamRequestDto) {
        TeamResponseDto createdTeam = teamService.create(teamRequestDto);
        return ResponseEntity.status(201).body(createdTeam);
    }
}
