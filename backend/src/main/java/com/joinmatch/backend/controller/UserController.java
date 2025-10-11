package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.JwtService;

import com.joinmatch.backend.dto.*;
import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.service.SportService;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;


@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    private final SportService sportService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        TokenSupportObject tokenSupportObject = userService.login(request);
        JwtResponse response = new JwtResponse();
        response.token = tokenSupportObject.getToken();
        response.refreshToken = tokenSupportObject.getRefreshToken();
        response.email = request.email();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/refreshToken")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody RefreshTokenRequest refreshToken){
        RefreshSupportObject refreshObject = userService.refreshToken(refreshToken.refreshToken());
        JwtResponse response = new JwtResponse();
        response.token = refreshObject.getTokenSupportObject().getToken();
        response.refreshToken = refreshObject.getTokenSupportObject().getRefreshToken();
        response.email = refreshObject.getUser().getEmail();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest logoutRequest){
        try{
            userService.logoutUser(logoutRequest.email());
        }catch (RuntimeException runtimeException){
            return  ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    //TODO do przeniesienia do sportControllera
    @GetMapping("/sports")
    public ResponseEntity<SportResponse> getSportsByUser(@RequestBody RequestSports requestSports){
        List<SportWithRatingDto> sports = sportService.getSportsForUser(requestSports.token());
        return ResponseEntity.ok(new SportResponse(sports));
    }
    @PatchMapping("/changePass")
    public ResponseEntity<String> changePassword(@RequestBody ChangePassDto changePassDto){
        try {
            userService.changePassword(changePassDto);
        }catch (IllegalArgumentException illegalArgumentException){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(illegalArgumentException.getMessage());

        }catch (RuntimeException runtimeException){
            return ResponseEntity.badRequest().body(runtimeException.getMessage());

        }
        return ResponseEntity.ok("Password changed");
    }
    @GetMapping("/user/details")
    public ResponseEntity<UserResponseDto> getUserDetails(@RequestParam String token){
        UserResponseDto simpleInfo;
        try {
             simpleInfo = userService.getSimpleInfo(token);
        }catch (IllegalArgumentException e){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(simpleInfo);
    }
}
