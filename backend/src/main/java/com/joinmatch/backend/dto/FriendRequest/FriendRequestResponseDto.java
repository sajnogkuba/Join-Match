package com.joinmatch.backend.dto.FriendRequest;

import com.joinmatch.backend.model.FriendRequest;

import java.time.LocalDateTime;

public record FriendRequestResponseDto(
        Integer requestId,
        Integer senderId,
        Integer receiverId,
        String senderName,
        String senderEmail,
        String senderUrlOfPicture,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FriendRequestResponseDto fromFriendRequest(FriendRequest friendRequest) {
        return new FriendRequestResponseDto(
                friendRequest.getRequestId(),
                friendRequest.getSender().getId(),
                friendRequest.getReceiver().getId(),
                friendRequest.getSender().getName(),
                friendRequest.getSender().getEmail(),
                friendRequest.getSender().getUrlOfPicture(),
                friendRequest.getStatus().name(),
                friendRequest.getCreatedAt(),
                friendRequest.getUpdatedAt()
        );
    }
}
