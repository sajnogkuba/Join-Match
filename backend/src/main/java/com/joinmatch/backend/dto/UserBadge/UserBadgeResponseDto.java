package com.joinmatch.backend.dto.UserBadge;

import com.joinmatch.backend.model.UserBadge;

import java.time.LocalDateTime;

public record UserBadgeResponseDto(
        Integer id,
        String code,
        String name,
        String description,
        String iconUrl,
        String conditionType,
        Integer conditionValue,
        Boolean active,
        String category,
        Boolean owned,
        LocalDateTime earnedAt
) {
    public static UserBadgeResponseDto fromUserBadge(UserBadge userBadge) {
        return new UserBadgeResponseDto(
                userBadge.getBadge().getId(),
                userBadge.getBadge().getCode(),
                userBadge.getBadge().getName(),
                userBadge.getBadge().getDescription(),
                userBadge.getBadge().getIconUrl(),
                userBadge.getBadge().getConditionType(),
                userBadge.getBadge().getConditionValue(),
                userBadge.getBadge().getActive(),
                userBadge.getBadge().getCategory(),
                true,
                userBadge.getEarnedAt()
        );
    }
}

