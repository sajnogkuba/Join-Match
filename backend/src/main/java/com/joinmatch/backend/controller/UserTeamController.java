package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.UserTeam.UserTeamResponseDto;
import com.joinmatch.backend.service.UserTeamService;
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
}
