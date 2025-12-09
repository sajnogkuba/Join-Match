package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.CookieUtil;
import com.joinmatch.backend.dto.Auth.GoogleAuthRequest;
import com.joinmatch.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private final UserService userService;


    @PostMapping("/google")
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody GoogleAuthRequest req, HttpServletResponse response) {
        try {
            var result = userService.loginByGoogle(req);
            CookieUtil.setAccessTokenCookie(response, result.token());
            CookieUtil.setRefreshTokenCookie(response, result.refreshToken());
            CookieUtil.setEmailCookie(response, result.email());
            return ResponseEntity.ok(Map.of("email", result.email()));
       }catch (IllegalArgumentException e){
           return ResponseEntity.badRequest().build();
       }catch (RuntimeException exception){
           return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
       }
    }
}
