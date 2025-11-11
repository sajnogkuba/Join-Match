package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamPost.TeamPostRequestDto;
import com.joinmatch.backend.dto.TeamPost.TeamPostResponseDto;
import com.joinmatch.backend.service.TeamPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{teamId}")
    public ResponseEntity<Page<TeamPostResponseDto>> getTeamPostById(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "createdAt") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @PathVariable Integer teamId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamPostResponseDto> posts = teamPostService.findAllByTeamId(pageable, sort, direction, teamId);
        if (posts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(posts);
    }
}
