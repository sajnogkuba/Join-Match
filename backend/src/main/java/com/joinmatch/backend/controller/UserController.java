package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.JwtService;

import com.joinmatch.backend.dto.JwtResponse;
import com.joinmatch.backend.dto.LoginRequest;
import com.joinmatch.backend.dto.RefreshTokenRequest;
import com.joinmatch.backend.dto.RegisterRequest;
import com.joinmatch.backend.dto.LogoutRequest;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        List<String> token = userService.login(request);
        JwtResponse response = new JwtResponse();
        response.token = token.get(0);
        response.refreshToken = token.get(1);
        response.email = request.email;
        return ResponseEntity.ok(response);
    }
    @PostMapping("/refreshToken")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody RefreshTokenRequest refreshToken){
        RefreshSupportObject refreshObject = userService.refreshToken(refreshToken.getRefreshToken());
        JwtResponse response = new JwtResponse();
        response.token = refreshObject.getTokens().get(0);
        response.refreshToken = refreshObject.getTokens().get(1);
        response.email = refreshObject.getUser().getEmail();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest logoutRequest){
        try{
            userService.logoutUser(logoutRequest.getEmail());
        }catch (RuntimeException runtimeException){
            return  ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
}
