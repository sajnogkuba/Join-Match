package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserSavedEventRequestDto;
import com.joinmatch.backend.dto.UserSavedEventResponseDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserSavedEvent;
import com.joinmatch.backend.repository.EventRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.repository.UserSavedEventRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSavedEventService {
    private final UserSavedEventRepository userSavedEventRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

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

    @Transactional
    public UserSavedEventResponseDto create(UserSavedEventRequestDto userSavedEventRequestDto) {
        UserSavedEvent userSavedEvent = new UserSavedEvent();
        return getUserEventResponseDto(userSavedEventRequestDto, userSavedEvent);
    }

    private UserSavedEventResponseDto getUserEventResponseDto(UserSavedEventRequestDto userSavedEventRequestDto, UserSavedEvent userSavedEvent) {
        User user = userRepository.findByEmail(userSavedEventRequestDto.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + userSavedEventRequestDto.userEmail() + " not found"));
        Event event = eventRepository.findById(userSavedEventRequestDto.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event with id " + userSavedEventRequestDto.eventId() + " not found"));
        userSavedEvent.setUser(user);
        userSavedEvent.setEvent(event);
        UserSavedEvent saved = userSavedEventRepository.save(userSavedEvent);
        return UserSavedEventResponseDto.fromUserSavedEvent(saved);
    }

    @Transactional
    public void delete(UserSavedEventRequestDto userSavedEventRequestDto) {
        User user = userRepository.findByEmail(userSavedEventRequestDto.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + userSavedEventRequestDto.userEmail() + " not found"));
        UserSavedEvent userSavedEvent = userSavedEventRepository.findByUserIdAndEventEventId(user.getId(), userSavedEventRequestDto.eventId());
        if (userSavedEvent == null) {
            throw new IllegalArgumentException("UserSavedEvent with user id " + user.getId() + " and event id " + userSavedEventRequestDto.eventId() + " not found");
        }
        userSavedEventRepository.delete(userSavedEvent);
    }
}
