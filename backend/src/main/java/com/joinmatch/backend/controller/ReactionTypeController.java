package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.ReactionType.ReactionTypeResponseDto;
import com.joinmatch.backend.service.ReactionTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reaction/type")
@RequiredArgsConstructor
public class ReactionTypeController {
    private final ReactionTypeService reactionTypeService;

    @GetMapping
    public ResponseEntity<List<ReactionTypeResponseDto>> getAllReactionTypes() {
        List<ReactionTypeResponseDto> reactionTypes = reactionTypeService.getAllReactionTypes();
        return ResponseEntity.ok(reactionTypes);
    }
}
