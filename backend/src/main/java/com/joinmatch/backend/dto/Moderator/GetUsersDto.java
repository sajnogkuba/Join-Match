package com.joinmatch.backend.dto.Moderator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

public record GetUsersDto(
        Integer id,
        String username,
        String email,
        Boolean isBlocked

) {}
