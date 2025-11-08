package com.joinmatch.backend.dto;

import java.util.List;

public record EventPageResponseDto(List<EventResponseDto> items, int total) {
}
