package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionResponseDto;
import com.joinmatch.backend.service.TeamPostReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reaction/team-post")
@RequiredArgsConstructor
public class TeamPostReactionController {
    private final TeamPostReactionService teamPostReactionService;

    @PostMapping
    public ResponseEntity<TeamPostReactionResponseDto> create(@RequestBody TeamPostReactionRequestDto dto) {
        TeamPostReactionResponseDto createdTeam = teamPostReactionService.create(dto);
        return ResponseEntity.status(201).body(createdTeam);
    }

    @PatchMapping
    public ResponseEntity<TeamPostReactionResponseDto> update(@RequestBody TeamPostReactionRequestDto dto) {
        TeamPostReactionResponseDto updatedReaction = teamPostReactionService.update(dto);
        return ResponseEntity.ok(updatedReaction);
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestBody TeamPostReactionRequestDto dto) {
        teamPostReactionService.delete(dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}" )
    public ResponseEntity<Page<TeamPostReactionResponseDto>> get(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "createdAt") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @PathVariable Integer postId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamPostReactionResponseDto> reactions = teamPostReactionService.findAllByPostId(pageable, sort, direction, postId);
        if (reactions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reactions);
    }
}
