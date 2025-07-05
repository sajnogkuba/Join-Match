package com.joinmatch.backend.controller;

import com.joinmatch.backend.Config.JwtService;
import com.joinmatch.backend.DTO.JwtResponse;
import com.joinmatch.backend.DTO.LoginRequest;
import com.joinmatch.backend.DTO.RegisterRequest;
import com.joinmatch.backend.Service.UserService;
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
//    @PostMapping("/refreshToken")
//    public ResponseEntity<JwtResponse> refreshToken(@RequestBody String refreshToken){
//
//        return ResponseEntity.ok();
//    }
}
