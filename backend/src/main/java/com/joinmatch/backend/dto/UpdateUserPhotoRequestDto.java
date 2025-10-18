package com.joinmatch.backend.dto;

public record UpdateUserPhotoRequestDto (
        String photoUrl,
        String token
){}
