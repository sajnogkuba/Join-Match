package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Reports.TeamReportDto;
import com.joinmatch.backend.dto.Team.CancelTeamRequestDto;
import com.joinmatch.backend.dto.Team.TeamDetailsDto;
import com.joinmatch.backend.dto.Team.TeamRequestDto;
import com.joinmatch.backend.dto.Team.TeamResponseDto;
import com.joinmatch.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamResponseDto> teams = teamService.findAll(pageable, sort, direction);
        if (teams.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teams);
    }


    @GetMapping("/by-leader")
    public ResponseEntity<Page<TeamResponseDto>> getTeamsByLeaderId(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @RequestParam Integer leaderId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamResponseDto> teams = teamService.findAllByLeaderId(pageable, sort, direction, leaderId);
        if (teams.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/by-user")
    public ResponseEntity<Page<TeamResponseDto>> getTeamsByUserId(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @RequestParam Integer userId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<TeamResponseDto> teams = teamService.findAllByUserId(pageable, sort, direction, userId);
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

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable("id") Integer teamId,
            @RequestBody(required = false) CancelTeamRequestDto requestDto
            ) {
        teamService.deleteTeam(teamId, requestDto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("{id}")
    public ResponseEntity<TeamResponseDto> updateTeam(@PathVariable Integer id, @RequestBody TeamRequestDto teamRequestDto) {
        TeamResponseDto updatedTeam = teamService.updateTeam(id, teamRequestDto);
        return ResponseEntity.ok(updatedTeam);
    }
    @PostMapping("/report/team")
    public ResponseEntity<Void> reportTeam(@RequestBody TeamReportDto teamReportDto){
        try {
            teamService.reportUserRating(teamReportDto);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }catch (RuntimeException exception){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok().build();
    }

}
