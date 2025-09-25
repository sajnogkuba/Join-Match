package com.joinmatch.backend.supportObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenSupportObject {
    private String token;
    private String refreshToken;
}
