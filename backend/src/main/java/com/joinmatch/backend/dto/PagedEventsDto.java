package com.joinmatch.backend.dto;

import java.util.List;

public record PagedEventsDto(List<EventResponseDto> items,
                             boolean hasMore,
                             int nextOffset) {
}
