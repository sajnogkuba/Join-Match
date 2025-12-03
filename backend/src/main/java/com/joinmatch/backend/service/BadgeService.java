package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Badge.BadgeResponseDto;
import com.joinmatch.backend.model.Badge;
import com.joinmatch.backend.repository.BadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public List<BadgeResponseDto> getAllBadges() {
        return badgeRepository.findAll()
                .stream()
                .filter(Badge::getActive)
                .map(BadgeResponseDto::fromBadge)
                .toList();
    }
}
