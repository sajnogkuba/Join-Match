package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Moderator.GetStatisticsForDashboard;
import com.joinmatch.backend.service.ModeratorService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moderator")
@RequiredArgsConstructor
public class ModeratorController {
    private final ModeratorService moderatorService;

    @GetMapping("/dashboard")
    public ResponseEntity<GetStatisticsForDashboard> getStatisticsForDashboardResponseEntity(){
        GetStatisticsForDashboard statisticsForDashboard = moderatorService.getStatisticsForDashboard();
        return ResponseEntity.ok(statisticsForDashboard);
    }

}