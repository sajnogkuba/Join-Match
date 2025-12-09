package com.joinmatch.backend.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {

    private static final int ACCESS_TOKEN_MAX_AGE = 15 * 60;
    private static final int REFRESH_TOKEN_MAX_AGE = 4 * 60 * 60;
    private static final int EMAIL_MAX_AGE = 4 * 60 * 60;
    private static final String COOKIE_PATH = "/";
    private static final boolean SECURE = false;

    public static void setAccessTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(false);
        cookie.setSecure(SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(ACCESS_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    public static void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(REFRESH_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    public static void setEmailCookie(HttpServletResponse response, String email) {
        Cookie cookie = new Cookie("email", email);
        cookie.setHttpOnly(false);
        cookie.setSecure(SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(EMAIL_MAX_AGE);
        response.addCookie(cookie);
    }

    public static String getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public static void clearCookie(HttpServletResponse response, String cookieName) {
        boolean isHttpOnly = "refreshToken".equals(cookieName);
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(isHttpOnly);
        cookie.setSecure(SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public static void clearAllAuthCookies(HttpServletResponse response) {
        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");
        clearCookie(response, "email");
    }
}

