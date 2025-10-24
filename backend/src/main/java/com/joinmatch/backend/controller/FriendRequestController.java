package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.FriendRequestDto;
import com.joinmatch.backend.dto.FriendRequestResponseDto;
import com.joinmatch.backend.model.FriendRequest;
import com.joinmatch.backend.service.FriendRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @GetMapping("/requests/{receiverId}")
    public ResponseEntity<List<FriendRequestResponseDto>> getPendingFriendRequestByReceiverId(
            @PathVariable Integer receiverId) {
        List<FriendRequestResponseDto> response = friendRequestService.getPendingRequestByReceiverId(receiverId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/request")
    public ResponseEntity<FriendRequestResponseDto> sendFriendRequest(
            @RequestBody FriendRequestDto requestDto) {
        FriendRequestResponseDto response = friendRequestService.sendRequest(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/request/{requestId}")
    public ResponseEntity<Void> respondToFriendRequest(
            @PathVariable Integer requestId) {
        friendRequestService.deleteRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/request/{requestId}/accept")
    public ResponseEntity<Void> acceptFriendRequest(
            @PathVariable Integer requestId) {
        friendRequestService.acceptRequest(requestId);
        return ResponseEntity.ok().build();
    }
}
