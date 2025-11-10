package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.FriendRequest.FriendResponseDto;
import com.joinmatch.backend.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<FriendResponseDto>> getFriendsByUserId(@PathVariable Integer userId, @RequestParam(required = false) String query) {
        List<FriendResponseDto> friends = friendshipService.getFriendsByUserId(userId, query);
        return ResponseEntity.ok(friends);
    }

    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<Void> deleteFriendship(@PathVariable Integer friendshipId) {
        friendshipService.deleteFriendship(friendshipId);
        return ResponseEntity.noContent().build();
    }
}
