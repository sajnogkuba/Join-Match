package com.joinmatch.backend.dto.Auth;

public record JwtResponse(String token,String refreshToken,String email) {

}