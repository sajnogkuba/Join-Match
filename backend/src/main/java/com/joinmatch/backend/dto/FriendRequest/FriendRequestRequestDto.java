package com.joinmatch.backend.dto.FriendRequest;

public record FriendRequestRequestDto(
        Integer senderId,
        Integer receiverId
) {
}
