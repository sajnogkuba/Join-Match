package com.joinmatch.backend.dto;

import com.joinmatch.backend.dto.Event.EventResponseDto;

import java.util.List;

public record PagedEventsDto(List<EventResponseDto> items,
                             boolean hasMore,
                             int nextOffset) {
}
