package com.joinmatch.backend.Service;

import com.joinmatch.backend.Config.JwtService;
import com.joinmatch.backend.DTO.LoginRequest;
import com.joinmatch.backend.DTO.RegisterRequest;
import com.joinmatch.backend.Model.Role;
import com.joinmatch.backend.Model.User;
import com.joinmatch.backend.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtService.generateToken(user);
    }
}
