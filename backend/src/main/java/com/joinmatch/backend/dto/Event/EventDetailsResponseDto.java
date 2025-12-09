package com.joinmatch.backend.dto.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EventDetailsResponseDto (
        Integer eventId,
        String eventName,
     Integer numberOfParticipants,
     Integer bookedParticipants,

     BigDecimal cost,
     String currency,
     String status,
     LocalDateTime eventDate,
     Integer scoreTeam1,
     Integer scoreTeam2,

     String sportTypeName,
        String sportTypeURL,
     String sportObjectName,

     Integer sportObjectId,
     String city,
     String street,
     Integer number,
     Integer secondNumber,

     Integer eventVisibilityId,
     String eventVisibilityName,

     Integer ownerId,
     String ownerName,
     String ownerAvatarUrl,

     String skillLevel,
     String paymentMethod,
     String imageUrl,

     Double latitude,
     Double longitude
)
{}
