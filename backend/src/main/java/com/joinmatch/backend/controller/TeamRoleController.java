package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.TeamRole.TeamRoleRequestDto;
import com.joinmatch.backend.dto.TeamRole.TeamRoleResponseDto;
import com.joinmatch.backend.dto.TeamRole.TeamRoleUpdateDto;
import com.joinmatch.backend.service.TeamRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-role")
@RequiredArgsConstructor
public class TeamRoleController {
    private final TeamRoleService teamRoleService;

    @GetMapping("/{teamId}")
    public ResponseEntity<List<TeamRoleResponseDto>> getTeamRoles(
            @PathVariable Integer teamId
    ) {
        List<TeamRoleResponseDto> roles = teamRoleService.findAllByTeamId(teamId);
        if (roles.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(roles);
    }

    @PostMapping
    public ResponseEntity<TeamRoleResponseDto> createTeamRole(
            @RequestBody @Valid TeamRoleRequestDto requestDto
    ) {
        TeamRoleResponseDto createdRole = teamRoleService.create(requestDto);
        return ResponseEntity.status(201).body(createdRole);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<TeamRoleResponseDto> updateTeamRole(
            @PathVariable Integer roleId,
            @RequestBody @Valid TeamRoleUpdateDto updateDto
    ) {
        TeamRoleResponseDto updatedRole = teamRoleService.update(roleId, updateDto);
        return ResponseEntity.ok(updatedRole);
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteTeamRole(
            @PathVariable Integer roleId
    ) {
        teamRoleService.delete(roleId);
        return ResponseEntity.noContent().build();
    }
}
