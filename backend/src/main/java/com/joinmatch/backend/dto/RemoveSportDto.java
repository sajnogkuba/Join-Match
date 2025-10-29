package com.joinmatch.backend.dto;

import software.amazon.awssdk.services.s3.endpoints.internal.Value;

public record RemoveSportDto(String token, Integer idSport) {
}
