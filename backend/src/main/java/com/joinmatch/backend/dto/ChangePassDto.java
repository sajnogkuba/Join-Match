package com.joinmatch.backend.dto;

public record ChangePassDto (String token, String oldPassword, String newPassword) {
}
