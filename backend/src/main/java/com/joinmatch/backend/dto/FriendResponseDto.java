package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.User;

public record FriendResponseDto(
        Integer id,
        String name,
        String email,
        String urlOfPicture,
        Integer friendshipId
) {
    public static FriendResponseDto fromUser(User useruser, Integer friendshipId) {
        return new FriendResponseDto(
                useruser.getId(),
                useruser.getName(),
                useruser.getEmail(),
                useruser.getUrlOfPicture(),
                friendshipId
        );
    }
}
