package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamDetailsDto;
import com.joinmatch.backend.dto.TeamRequestDto;
import com.joinmatch.backend.dto.TeamResponseDto;
import com.joinmatch.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamResponseDto> createTeam(@RequestBody TeamRequestDto teamRequestDto) {
        TeamResponseDto createdTeam = teamService.create(teamRequestDto);
        return ResponseEntity.status(201).body(createdTeam);
    }

    @GetMapping
    public ResponseEntity<Page<TeamResponseDto>> getAllTeams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer sportTypeId,
            @RequestParam(required = false) String leaderName
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<TeamResponseDto> teams = teamService.findAll(
                pageable,
                sortBy,
                direction,
                name,
                sportTypeId,
                leaderName
        );

        if (teams.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teams);
    }



    @GetMapping("/by-leader")
    public ResponseEntity<Page<TeamResponseDto>> getTeamsByLeaderId(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam Integer leaderId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer sportTypeId,
            @RequestParam(required = false) String leaderName
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TeamResponseDto> teams = teamService.findAllByLeaderId(pageable, sortBy, direction, leaderId, name, sportTypeId, leaderName);
        if (teams.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teams);
    }


    @GetMapping("{id}")
    public ResponseEntity<TeamDetailsDto> getTeamById(@PathVariable Integer id) {
        TeamDetailsDto teamDetailsDto = teamService.getTeamDetails(id);
        return ResponseEntity.ok(teamDetailsDto);
    }

}
