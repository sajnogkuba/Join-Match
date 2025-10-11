package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.SportTypeResponseDto;
import com.joinmatch.backend.dto.SportWithRatingDto;
import com.joinmatch.backend.model.JoinMatchToken;
import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.JoinMatchTokenRepository;
import com.joinmatch.backend.repository.SportRepository;
import com.joinmatch.backend.repository.SportUserRepository;
import com.joinmatch.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class SportService {
    private UserRepository userRepository;
    private final SportRepository sportRepository;


    @Transactional(readOnly = true)
    public List<SportWithRatingDto> getSportsForUser(String token) {
        User u = userRepository.findUserWithSportsByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy token"));

        return u.getSportUsers().stream()
                .map(su -> new SportWithRatingDto(
                        su.getSport().getId(),
                        su.getSport().getName(),
                        su.getSport().getURL(),   
                        su.getRating()
                ))
                .toList();
    }

    public List<SportTypeResponseDto> getAllSportTypes() {
        return sportRepository.findAll()
                .stream()
                .map(SportTypeResponseDto::fromSportType)
                .toList();
    }
}
