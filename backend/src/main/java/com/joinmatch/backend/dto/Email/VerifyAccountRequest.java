package com.joinmatch.backend.dto.Email;

public record VerifyAccountRequest(String email, String code) {
}
