package com.joinmatch.backend.dto.Sport;

public record SportWithRatingDto(
        Integer sportId,
        String name,
        String url,
        Integer rating,
        Boolean isMain
) {}
