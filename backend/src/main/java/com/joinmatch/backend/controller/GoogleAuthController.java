package com.joinmatch.backend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.joinmatch.backend.dto.Auth.GoogleAuthRequest;
import com.joinmatch.backend.service.GoogleTokenVerifier;
import com.joinmatch.backend.dto.Auth.JwtResponse;
import com.joinmatch.backend.model.Role;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private final GoogleTokenVerifier tokenVerifier;
    private final UserRepository userRepository;
    private final UserService userService;

    public GoogleAuthController(GoogleTokenVerifier tokenVerifier,
                                UserRepository userRepository,
                                UserService userService) {
        this.tokenVerifier = tokenVerifier;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest req) {
        GoogleIdToken.Payload payload = tokenVerifier.verify(req.idToken());
        if (payload == null) {
            return ResponseEntity.badRequest().body("Invalid Google ID token");
        }

        String email = payload.getEmail();
        String name  = (String) payload.get("name");

        // znajdź lub utwórz usera
        Optional<User> byEmail = userRepository.findByEmail(email);

        User user = byEmail.orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(name != null ? name : email);
            u.setPassword("test");
            u.setDateOfBirth(LocalDate.now());// konto Google bez hasła
            u.setRole(Role.USER);
            u.setIsBlocked(false);
            return userRepository.save(u);
        });
        if(user.getIsBlocked()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // wystaw Twoje tokeny
        TokenSupportObject tokenSupportObject = userService.issueTokensFor(user);

        JwtResponse resp = new JwtResponse(tokenSupportObject.getToken(),tokenSupportObject.getRefreshToken(),email);


        return ResponseEntity.ok(resp);
    }
}
