package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamRequestResponseDto;
import com.joinmatch.backend.service.TeamRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/team-request")
@RequiredArgsConstructor
public class TeamRequestController {
    private final TeamRequestService teamRequestService;

    @GetMapping
    public ResponseEntity<Page<TeamRequestResponseDto>> findAll(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAll(pageable, sort, direction);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }

    @GetMapping("/by-team")
    public ResponseEntity<Page<TeamRequestResponseDto>> findAllByTeam(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @RequestParam Integer teamId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAllByTeamId(pageable, sort, direction, teamId);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }

    @GetMapping("/by-receiver")
    public ResponseEntity<Page<TeamRequestResponseDto>> findAllByReceiver(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @RequestParam Integer receiverId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAllByReceiverId(pageable, sort, direction, receiverId);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }
}
