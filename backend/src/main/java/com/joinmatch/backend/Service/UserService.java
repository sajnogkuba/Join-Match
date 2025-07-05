package com.joinmatch.backend.Service;

import com.joinmatch.backend.Config.JwtService;
import com.joinmatch.backend.DTO.LoginRequest;
import com.joinmatch.backend.DTO.RegisterRequest;
import com.joinmatch.backend.Model.JoinMatchToken;
import com.joinmatch.backend.Model.Role;
import com.joinmatch.backend.Model.User;
import com.joinmatch.backend.Repository.JoinMatchTokenRepository;
import com.joinmatch.backend.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JoinMatchTokenRepository joinMatchTokenRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,JoinMatchTokenRepository joinMatchTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.joinMatchTokenRepository = joinMatchTokenRepository;
    }

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
        joinMatchToken.setExpireDate(LocalDateTime.now().plusHours(4));
        joinMatchTokenRepository.save(joinMatchToken);
        return tokens;
    }
}
