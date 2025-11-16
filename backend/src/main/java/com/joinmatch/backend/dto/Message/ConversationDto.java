package com.joinmatch.backend.dto.Message;

import java.util.List;

public record ConversationDto(
        Integer id,
        String type,
        List<ParticipantDto> participants,
        Integer teamId,
        String teamName,
        Integer eventId,
        String eventName
) {}
