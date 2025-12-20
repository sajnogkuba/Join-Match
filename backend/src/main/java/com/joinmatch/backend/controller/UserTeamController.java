package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.UserTeam.AssignRoleRequestDto;
import com.joinmatch.backend.dto.UserTeam.RemoveMemberRequestDto;
import com.joinmatch.backend.dto.UserTeam.UserTeamResponseDto;
import com.joinmatch.backend.service.UserTeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-team")
@RequiredArgsConstructor
public class UserTeamController {
    private final UserTeamService userTeamService;

    @GetMapping("{teamId}/members")
    public ResponseEntity<Page<UserTeamResponseDto>> getTeamMembers(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "created_at") String sort,
            @RequestParam(required = false, defaultValue = "ASC") String direction,
            @PathVariable Integer teamId
    ) {
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<UserTeamResponseDto> members = userTeamService.findAllByTeamId(pageable, sort, direction, teamId);
        if (members.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeUserFromTeam(
            @PathVariable Integer teamId,
            @PathVariable Integer userId,
            @RequestBody(required = false) RemoveMemberRequestDto requestDto
    ) {
        String reason = requestDto != null ? requestDto.reason() : null;
        userTeamService.removeUserFromTeam(teamId, userId, reason);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{teamId}/members/{userId}/quit")
    public ResponseEntity<Void> quitFromTeam(
            @PathVariable Integer teamId,
            @PathVariable Integer userId,
            @RequestBody(required = false) RemoveMemberRequestDto requestDto
    ) {
        String reason = requestDto != null ? requestDto.reason() : null;
        userTeamService.quitFromTeam(teamId, userId, reason);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<UserTeamResponseDto> assignRole(
            @PathVariable Integer teamId,
            @PathVariable Integer userId,
            @RequestBody @Valid AssignRoleRequestDto requestDto
    ) {
        UserTeamResponseDto updatedMember = userTeamService.assignRole(teamId, userId, requestDto.roleId());
        return ResponseEntity.ok(updatedMember);
    }
}
