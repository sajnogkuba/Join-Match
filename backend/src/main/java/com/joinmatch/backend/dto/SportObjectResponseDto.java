package com.joinmatch.backend.dto;

public record SportObjectResponseDto (
        Integer id,
        String name,
        String city,
        String street,
        Integer number,
        Integer secondNumber,

        Double latitude,

        Double longitude
){ }
