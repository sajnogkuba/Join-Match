package com.joinmatch.backend.dto;

import com.joinmatch.backend.enums.FriendRequestStatus;


public record SearchResponseDto(
        Integer id,
        String name,
        String email,
        FriendRequestStatus friendRequestStatus,
        String urlOfPicture
) {
}
