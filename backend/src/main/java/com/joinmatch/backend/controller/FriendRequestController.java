package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.FriendRequestDto;
import com.joinmatch.backend.dto.FriendRequestResponseDto;
import com.joinmatch.backend.service.FriendRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @PostMapping("/request")
    public ResponseEntity<FriendRequestResponseDto> sendFriendRequest(
            @RequestBody FriendRequestDto requestDto) {
        FriendRequestResponseDto response = friendRequestService.sendRequest(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
