package com.joinmatch.backend.dto.Badge;

import com.joinmatch.backend.model.Badge;

public record BadgeResponseDto(
        Integer id,
        String code,
        String name,
        String description,
        String iconUrl,
        String conditionType,
        Integer conditionValue,
        Boolean active,
        String category
) {

    public static BadgeResponseDto fromBadge(Badge badge) {
        return new BadgeResponseDto(
                badge.getId(),
                badge.getCode(),
                badge.getName(),
                badge.getDescription(),
                badge.getIconUrl(),
                badge.getConditionType(),
                badge.getConditionValue(),
                badge.getActive(),
                badge.getCategory()
        );
    }
}