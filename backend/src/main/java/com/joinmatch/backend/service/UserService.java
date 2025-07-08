package com.joinmatch.backend.service;

import com.joinmatch.backend.Config.JwtService;
import com.joinmatch.backend.dto.LoginRequest;
import com.joinmatch.backend.dto.RegisterRequest;
import com.joinmatch.backend.model.JoinMatchToken;
import com.joinmatch.backend.model.Role;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.JoinMatchTokenRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JoinMatchTokenRepository joinMatchTokenRepository;


    public void register(RegisterRequest request) {
        // Sprawdź, czy email już istnieje
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setDateOfBirth(LocalDate.parse(request.dateOfBirth));
        user.setRole(Role.USER);
        userRepository.save(user);
        // Można dodać logikę wysyłania e-maila weryfikacyjnego
    }
/**
 * First in list is token and second is refreshToken
 */
    public List<String> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return generateAndSaveTokens(user);
    }
    public RefreshSupportObject refreshToken(String refreshToken){
        Optional<List<JoinMatchToken>> joinMatchTokenByRefreshToken = joinMatchTokenRepository.getJoinMatchTokenByRefreshToken(refreshToken);
        if(!joinMatchTokenByRefreshToken.isPresent()){
            throw new RuntimeException("Wrong refresh token");
        }
        List<JoinMatchToken> joinMatchTokens = joinMatchTokenByRefreshToken.get();
        JoinMatchToken joinMatchToken = null;
        for(int i = 0 ; i <joinMatchTokens.size();i++){
            if(LocalDateTime.now().isBefore(joinMatchTokens.get(i).getExpireDate()) && (!joinMatchTokens.get(i).getRevoked())){
                joinMatchToken = joinMatchTokens.get(i);
            }
        }
        if(joinMatchToken ==null){
            throw new RuntimeException("You have to login");
        }
        joinMatchToken.setRevoked(true);
        User user = joinMatchToken.getUser();
        return new RefreshSupportObject(user,generateAndSaveTokens(user));
    }
    public void logoutUser(String email){
        Optional<User> byEmail = userRepository.findByEmail(email);
        if(byEmail.isEmpty()){
            throw new RuntimeException("Nie ma takiego usera");
        }
        User user = byEmail.get();
        for(int i = 0 ; i < user.getTokens().size();i++){
            if(!user.getTokens().get(i).getRevoked()){
                user.getTokens().get(i).setRevoked(true);
            }
        }
        userRepository.save(user);

    }
    private List<String> generateAndSaveTokens(User user){
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        List<String> tokens = new ArrayList<>();
        tokens.add(token);
        tokens.add(refreshToken);
        JoinMatchToken joinMatchToken = new JoinMatchToken();
        joinMatchToken.setToken(token);
        joinMatchToken.setRefreshToken(refreshToken);
        joinMatchToken.setUser(user);
        joinMatchToken.setRevoked(false);
        joinMatchToken.setExpireDate(LocalDateTime.now().plusHours(JwtService.REFRESH_TOKEN_EXP_HOURS));
        joinMatchTokenRepository.save(joinMatchToken);
        return tokens;
    }
}
