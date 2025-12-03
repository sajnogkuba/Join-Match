package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Badge.BadgeResponseDto;
import com.joinmatch.backend.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<BadgeResponseDto>> getAllActiveBadges() {
        List<BadgeResponseDto> badges = badgeService.getAllBadges();
        if (badges.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(badges);
    }
}
