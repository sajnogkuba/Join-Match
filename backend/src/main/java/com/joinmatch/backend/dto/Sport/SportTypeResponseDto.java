package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.Sport;

public record SportTypeResponseDto(
        Integer id,
        String name,
        String url
) {
    public static SportTypeResponseDto fromSportType(Sport sport) {
        return new SportTypeResponseDto(
                sport.getId(),
                sport.getName(),
                sport.getURL()
        );
    }
}
