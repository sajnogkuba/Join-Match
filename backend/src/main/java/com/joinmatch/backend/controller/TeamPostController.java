package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamPost.TeamPostRequestDto;
import com.joinmatch.backend.dto.TeamPost.TeamPostResponseDto;
import com.joinmatch.backend.service.TeamPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/team-post")
@RequiredArgsConstructor
public class TeamPostController {
    private final TeamPostService teamPostService;

    @PostMapping
    public ResponseEntity<TeamPostResponseDto> createTeamPost(@RequestBody TeamPostRequestDto teamPostRequestDto) {
        TeamPostResponseDto createdPost = teamPostService.create(teamPostRequestDto);
        return ResponseEntity.status(201).body(createdPost);
    }
}
