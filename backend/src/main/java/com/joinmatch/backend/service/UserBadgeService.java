package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserBadge.UserBadgeResponseDto;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private final UserRepository userRepository;

    public final List<UserBadgeResponseDto> getUserBadges(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return user.getUserBadges().stream()
                .map(UserBadgeResponseDto::fromUserBadge)
                .toList();
    }
}
