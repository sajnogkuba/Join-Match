package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamPostComment.TeamPostCommentResponseDto;
import com.joinmatch.backend.service.TeamPostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class TeamPostCommentController {
    private final TeamPostCommentService teamPostCommentService;

    @PostMapping
    public ResponseEntity<TeamPostCommentResponseDto> postComment(@RequestBody TeamPostCommentResponseDto dto) {
        TeamPostCommentResponseDto createdComment = teamPostCommentService.createComment(dto);
        return ResponseEntity.status(201).body(createdComment);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Page<TeamPostCommentResponseDto>> getCommentsByPostId(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "createdAt") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @PathVariable Integer postId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamPostCommentResponseDto> comments = teamPostCommentService.findAllByPostId(pageable, sort, direction, postId);
        if (comments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(comments);
    }

}
