package com.joinmatch.backend.dto;

public class LogoutRequest {
    private String email;

    public LogoutRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}

