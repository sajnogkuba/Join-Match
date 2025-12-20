package com.joinmatch.backend.config;

import jakarta.servlet.http.HttpServletRequest;

public class TokenExtractor {

    public static String extractToken(HttpServletRequest request) {
        String token = CookieUtil.getCookieValue(request, "accessToken");
        if (token != null) {
            return token;
        }
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        return null;
    }
}

