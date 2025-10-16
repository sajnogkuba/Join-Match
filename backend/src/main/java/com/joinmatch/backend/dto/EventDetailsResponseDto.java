package com.joinmatch.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDetailsResponseDto {
    private Long eventId;
    private String eventName;
    private Integer numberOfParticipants;

    //TODO
    // private Integer bookedParticipants;

    private BigDecimal cost;
    private String currency;
    private String status;
    private LocalDateTime eventDate;
    private Integer scoreTeam1;
    private Integer scoreTeam2;

    private String sportTypeName;
    private String sportObjectName;

    private Integer sportObjectId;
    private String city;
    private String street;
    private Integer number;
    private Integer secondNumber;
    private Integer capacity;

    private Integer eventVisibilityId;
    private String eventVisibilityName;
    private Integer ownerId;
    private String ownerName;
    //TODO
    //private String ownerAvatarUrl;

    private String skillLevel;
    private String paymentMethod;
    //TODO
    //private String imageUrl;
}
