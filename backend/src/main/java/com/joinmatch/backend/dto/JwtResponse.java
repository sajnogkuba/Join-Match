package com.joinmatch.backend.dto;

public record JwtResponse(String token,String refreshToken,String email) {

}