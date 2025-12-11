package com.joinmatch.backend.config;

import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;

public class CookieUtil {

    private static final int ACCESS_TOKEN_MAX_AGE = 60;
    private static final int REFRESH_TOKEN_MAX_AGE = 4 * 60 * 60;
    private static final int EMAIL_MAX_AGE = 4 * 60 * 60;

    // KONFIGURACJA DLA LOCALHOST (HTTP)
    // Na produkcji (HTTPS) zmień: SECURE = true, SAME_SITE = "None"
    private static final boolean SECURE = false;
    private static final String SAME_SITE = "Lax";

    public static void setAccessTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(SECURE)
                .path("/")
                .maxAge(ACCESS_TOKEN_MAX_AGE)
                .sameSite(SAME_SITE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void setRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(SECURE)
                .path("/")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .sameSite(SAME_SITE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void setEmailCookie(HttpServletResponse response, String email) {
        ResponseCookie cookie = ResponseCookie.from("email", email)
                .httpOnly(false) // false, żeby JS mógł to odczytać
                .secure(SECURE)
                .path("/")
                .maxAge(EMAIL_MAX_AGE)
                .sameSite(SAME_SITE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static String getCookieValue(HttpServletRequest request, String cookieName) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public static void clearAllAuthCookies(HttpServletResponse response) {
        ResponseCookie access = ResponseCookie.from("accessToken", "")
                .httpOnly(true).secure(SECURE).path("/").maxAge(0).sameSite(SAME_SITE).build();
        ResponseCookie refresh = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(SECURE).path("/").maxAge(0).sameSite(SAME_SITE).build();
        ResponseCookie email = ResponseCookie.from("email", "")
                .httpOnly(false).secure(SECURE).path("/").maxAge(0).sameSite(SAME_SITE).build();

        response.addHeader(HttpHeaders.SET_COOKIE, access.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refresh.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, email.toString());
    }
}