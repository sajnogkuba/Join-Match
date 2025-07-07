package com.joinmatch.backend.DTO;

public class LogoutRequest {
    private String email;

    public LogoutRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}

