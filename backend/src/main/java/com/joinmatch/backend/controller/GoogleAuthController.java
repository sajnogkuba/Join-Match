package com.joinmatch.backend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.joinmatch.backend.dto.Auth.GoogleAuthRequest;
import com.joinmatch.backend.service.GoogleTokenVerifier;
import com.joinmatch.backend.dto.Auth.JwtResponse;
import com.joinmatch.backend.model.Role;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private final UserService userService;


    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest req) {
        JwtResponse jwtResponse;
        try {
            jwtResponse = userService.loginByGoogle(req);
       }catch (IllegalArgumentException e){
           return ResponseEntity.badRequest().build();
       }catch (RuntimeException exception){
           return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
       }
       return ResponseEntity.ok(jwtResponse);
    }
}
