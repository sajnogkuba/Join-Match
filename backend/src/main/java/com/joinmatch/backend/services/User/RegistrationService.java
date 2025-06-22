package com.joinmatch.backend.services.User;

import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class RegistrationService implements RegistrationServiceInterface{
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public RegistrationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User register(String email, String rawPassword,String name, LocalDate birthdate) {
        if(userRepository.findByEmail(email).isPresent()){
            throw new IllegalArgumentException("User allready exists");
        }
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(encoder.encode(rawPassword));
        newUser.setSalt("11111111111111111111");
        newUser.setDateOfBrith(birthdate);

        return userRepository.save(newUser);
    }
}
