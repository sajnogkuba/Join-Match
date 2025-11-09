package com.joinmatch.backend.dto.ChangePass;

public record ChangePassDto (String token, String oldPassword, String newPassword) {
}
