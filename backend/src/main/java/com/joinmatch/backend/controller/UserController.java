package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.CookieUtil;
import com.joinmatch.backend.config.JwtService;

import com.joinmatch.backend.dto.*;
import com.joinmatch.backend.dto.Auth.*;
import com.joinmatch.backend.dto.ChangePass.ChangePassDto;
import com.joinmatch.backend.dto.Email.VerifyAccountRequest;
import com.joinmatch.backend.dto.Moderator.GetUsersDto;
import com.joinmatch.backend.dto.Reports.UserReportDto;
import com.joinmatch.backend.service.SportService;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


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
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        TokenSupportObject tokenSupportObject;
        try {
            tokenSupportObject = userService.login(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        CookieUtil.setAccessTokenCookie(response, tokenSupportObject.getToken());
        CookieUtil.setRefreshTokenCookie(response, tokenSupportObject.getRefreshToken());
        CookieUtil.setEmailCookie(response, request.email());
        return ResponseEntity.ok(Map.of("email", request.email()));
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<Void> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = CookieUtil.getCookieValue(request, "refreshToken");
        if (refreshTokenValue == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        RefreshSupportObject refreshObject = userService.refreshToken(refreshTokenValue);
        CookieUtil.setAccessTokenCookie(response, refreshObject.getTokenSupportObject().getToken());
        CookieUtil.setRefreshTokenCookie(response, refreshObject.getTokenSupportObject().getRefreshToken());
        CookieUtil.setEmailCookie(response, refreshObject.getUser().getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest logoutRequest, HttpServletResponse response) {
        try {
            userService.logoutUser(logoutRequest.email());
        } catch (RuntimeException runtimeException) {
            return ResponseEntity.badRequest().build();
        }
        CookieUtil.clearAllAuthCookies(response);
        return ResponseEntity.ok().build();
    }
    //TODO do przeniesienia do sportControllera

    @PatchMapping("/changePass")
    public ResponseEntity<String> changePassword(@RequestBody ChangePassDto changePassDto, HttpServletRequest request) {
        try {
            userService.changePassword(changePassDto, request);
        } catch (IllegalArgumentException illegalArgumentException) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(illegalArgumentException.getMessage());

        } catch (RuntimeException runtimeException) {
            return ResponseEntity.badRequest().body(runtimeException.getMessage());

        }
        return ResponseEntity.ok("Password changed");
    }

    @GetMapping("/user/details")
    public ResponseEntity<UserResponseDto> getUserDetails(HttpServletRequest request) {
        UserResponseDto simpleInfo;
        try {
            simpleInfo = userService.getSimpleInfo(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok().body(simpleInfo);
    }

    @PatchMapping("/user/photo")
    public ResponseEntity<String> updateUserPhoto(@RequestBody UpdateUserPhotoRequestDto requestDto, HttpServletRequest request) {
        try {
            userService.updateUserPhoto(requestDto.photoUrl(), request);
            return ResponseEntity.ok("Photo updated");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public List<SearchResponseDto> searchUsers(@RequestParam String query, @RequestParam Integer senderId) {
        return userService.searchUsers(query, senderId);
    }

    @GetMapping("/user")
    public ResponseEntity<UserResponseDto> getUser(HttpServletRequest request) {
        try {
            UserResponseDto user = userService.getSimpleInfo(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UsersResponseDto> getUserById(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer viewerId
    ) {
        UsersResponseDto user = userService.getUserById(id, viewerId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/block/user")
    public ResponseEntity<Void> blockUser(@RequestBody BlockUserDto blockUserDto) {
        try {
            userService.changeStatusOfBlock(blockUserDto.email(), true);
        } catch (
                IllegalArgumentException e
        ) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/unlock/user")
    public ResponseEntity<Void> unlockUser(@RequestBody BlockUserDto blockUserDto) {
        try {
            userService.changeStatusOfBlock(blockUserDto.email(), false);
        } catch (
                IllegalArgumentException e
        ) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/moderation")
    public ResponseEntity<Page<GetUsersDto>> getUsersForModeration(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<GetUsersDto> result = userService.getUsersForModeration(pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/report/user")
    public ResponseEntity<Void> reportUser(@RequestBody UserReportDto userReportDto, HttpServletRequest request) {
        try {
            userService.reportUser(userReportDto, request);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestBody VerifyAccountRequest request) {
        try {
            userService.verifyUser(request.email(), request.code());
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
