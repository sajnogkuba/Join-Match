package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamRequest.TeamRequestRequestDto;
import com.joinmatch.backend.dto.TeamRequest.TeamRequestResponseDto;
import com.joinmatch.backend.service.TeamRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team-request")
@RequiredArgsConstructor
public class TeamRequestController {
    private final TeamRequestService teamRequestService;

    @GetMapping
    public ResponseEntity<Page<TeamRequestResponseDto>> findAll(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAll(pageable);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }

    @GetMapping("/by-team")
    public ResponseEntity<Page<TeamRequestResponseDto>> findAllByTeam(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam Integer teamId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAllByTeamId(pageable, teamId);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }

    @GetMapping("/by-receiver")
    public ResponseEntity<Page<TeamRequestResponseDto>> findAllByReceiver(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam Integer receiverId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamRequestResponseDto> teamRequests = teamRequestService.findAllByReceiverId(pageable, receiverId);
        if (teamRequests.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teamRequests);
    }

    @PostMapping
    public ResponseEntity<TeamRequestResponseDto> createTeamRequest(@RequestBody TeamRequestRequestDto dto) {
        TeamRequestResponseDto createdTeamRequest = teamRequestService.create(dto);
        return ResponseEntity.status(201).body(createdTeamRequest);
    }
}
