package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Rankings.UserRankingResponseDto;
import com.joinmatch.backend.service.RankingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingsController {

    private final RankingsService rankingsService;

    @GetMapping("/users/general")
    public ResponseEntity<List<UserRankingResponseDto>> getGeneralUserRanking(
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer minRatings
    ) {
        List<UserRankingResponseDto> ranking = rankingsService.getGeneralUserRanking(limit, minRatings);
        return ResponseEntity.ok(ranking);
    }

    @GetMapping("/users/activity")
    public ResponseEntity<List<UserRankingResponseDto>> getActivityUserRanking(
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        List<UserRankingResponseDto> ranking = rankingsService.getActivityUserRanking(limit);
        return ResponseEntity.ok(ranking);
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getAvailableCities() {
        List<String> cities = rankingsService.getAvailableCities();
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/users/local")
    public ResponseEntity<List<UserRankingResponseDto>> getLocalUserRanking(
            @RequestParam String city,
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        List<UserRankingResponseDto> ranking = rankingsService.getLocalUserRanking(city, limit);
        return ResponseEntity.ok(ranking);
    }
}
