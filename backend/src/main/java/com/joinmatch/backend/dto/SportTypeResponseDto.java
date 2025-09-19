package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.SportType;

public record SportTypeResponseDto(
        Integer id,
        String name
) {
    public static SportTypeResponseDto fromSportType(SportType sportType) {
        return new SportTypeResponseDto(
                sportType.getId(),
                sportType.getName()
        );
    }
}
