package com.joinmatch.backend.dto.Sport;

public record ChangeNameOfSportDto(
        Integer sportId,
        String newName
) {
}
