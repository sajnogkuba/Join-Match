package com.joinmatch.backend.dto;

public record SportWithRatingDto(
        Integer sportId,
        String name,
        String url,
        Integer rating,
        Boolean isMain
) {}
