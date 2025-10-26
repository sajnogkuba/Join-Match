package com.joinmatch.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record UsersResponseDto(
        Integer id,
        String name,
        String email,
        LocalDate dateOfBirth,
        String urlOfPicture,
        List<SportInfo> sports,
        List<FriendInfo> friends
) {
    public record SportInfo(Integer id, String name, String level) {}
    public record FriendInfo(Integer id, String name, String email, String urlOfPicture) {}
}
