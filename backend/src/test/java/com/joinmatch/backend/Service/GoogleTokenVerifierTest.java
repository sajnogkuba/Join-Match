package com.joinmatch.backend.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.joinmatch.backend.service.GoogleTokenVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoogleTokenVerifierTest {

    private GoogleTokenVerifier googleTokenVerifier;
    private GoogleIdTokenVerifier mockGoogleVerifier;

    @BeforeEach
    void setup() throws Exception {
        // Tworzymy testowy obiekt GoogleTokenVerifier
        googleTokenVerifier = new GoogleTokenVerifier("test-client-id");

        // Tworzymy mock GoogleIdTokenVerifier
        mockGoogleVerifier = Mockito.mock(GoogleIdTokenVerifier.class);

        // Refleksyjnie podmieniamy prywatne pole "verifier"
        Field field = GoogleTokenVerifier.class.getDeclaredField("verifier");
        field.setAccessible(true);
        field.set(googleTokenVerifier, mockGoogleVerifier);
    }

    @Test
    void verify_shouldReturnPayload_whenTokenValid() throws Exception {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);

        when(googleIdToken.getPayload()).thenReturn(payload);
        when(mockGoogleVerifier.verify("VALID_TOKEN")).thenReturn(googleIdToken);

        GoogleIdToken.Payload result = googleTokenVerifier.verify("VALID_TOKEN");

        assertNotNull(result);
        assertSame(payload, result);
    }

    @Test
    void verify_shouldReturnNull_whenTokenInvalid() throws Exception {
        when(mockGoogleVerifier.verify("BAD_TOKEN")).thenReturn(null);

        GoogleIdToken.Payload result = googleTokenVerifier.verify("BAD_TOKEN");

        assertNull(result);
    }

    @Test
    void verify_shouldReturnNull_whenVerifierThrowsException() throws Exception {
        when(mockGoogleVerifier.verify("ERR_TOKEN"))
                .thenThrow(new RuntimeException("Google API error"));

        GoogleIdToken.Payload result = googleTokenVerifier.verify("ERR_TOKEN");

        assertNull(result);
    }
}
