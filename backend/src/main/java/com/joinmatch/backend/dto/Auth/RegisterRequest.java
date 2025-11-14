package com.joinmatch.backend.dto.Auth;

public record RegisterRequest (String name,String email, String password, String dateOfBirth){
}