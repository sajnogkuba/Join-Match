package com.joinmatch.backend.dto;

public record FriendRequestDto(
        Integer senderId,
        Integer receiverId
) {
}
