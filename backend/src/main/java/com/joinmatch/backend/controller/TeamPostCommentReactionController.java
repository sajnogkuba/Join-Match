package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionBatchRequestDto;
import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionResponseDto;
import com.joinmatch.backend.service.TeamPostCommentReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reaction/team-post-comment")
@RequiredArgsConstructor
public class TeamPostCommentReactionController {
    private final TeamPostCommentReactionService teamPostCommentReactionService;

    @PostMapping
    public ResponseEntity<TeamPostCommentReactionResponseDto> create(@RequestBody TeamPostCommentReactionRequestDto dto) {
        TeamPostCommentReactionResponseDto created = teamPostCommentReactionService.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PatchMapping
    public ResponseEntity<TeamPostCommentReactionResponseDto> update(@RequestBody TeamPostCommentReactionRequestDto dto) {
        TeamPostCommentReactionResponseDto updatedReaction = teamPostCommentReactionService.update(dto);
        return ResponseEntity.ok(updatedReaction);
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestBody TeamPostCommentReactionRequestDto dto) {
        teamPostCommentReactionService.delete(dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{commentId}" )
    public ResponseEntity<Page<TeamPostCommentReactionResponseDto>> get(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "createdAt") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @PathVariable Integer commentId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamPostCommentReactionResponseDto> reactions = teamPostCommentReactionService.findAllByCommentId(pageable, sort, direction, commentId);
        if (reactions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reactions);
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<Integer, Integer>> getUserReactionsBatch(@RequestBody TeamPostCommentReactionBatchRequestDto dto) {
        Map<Integer, Integer> reactions = teamPostCommentReactionService.getUserReactionsBatch(dto.commentIds(), dto.userId());
        return ResponseEntity.ok(reactions);
    }

}
