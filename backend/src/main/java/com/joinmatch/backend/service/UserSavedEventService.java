package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserEventResponseDto;
import com.joinmatch.backend.dto.UserSavedEventResponseDto;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.repository.UserSavedEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSavedEventService {
    private final UserSavedEventRepository userSavedEventRepository;
    private final UserRepository userRepository;

    public List<UserSavedEventResponseDto> getAllUserSavedEvents() {
        return userSavedEventRepository.findAll()
                .stream()
                .map(UserSavedEventResponseDto::fromUserSavedEvent)
                .toList();
    }

    public List<UserSavedEventResponseDto> getUserEventsByUserEmail(String userEmail){
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + userEmail + " not found"));
        return userSavedEventRepository.findByUserId(user.getId())
                .stream()
                .map(UserSavedEventResponseDto::fromUserSavedEvent)
                .toList();
    }
}
