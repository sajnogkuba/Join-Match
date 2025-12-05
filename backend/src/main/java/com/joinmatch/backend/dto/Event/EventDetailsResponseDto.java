package com.joinmatch.backend.dto.Event;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDetailsResponseDto {
    private Integer eventId;
    private String eventName;
    private String description;
    private Integer numberOfParticipants;
    private Integer bookedParticipants;

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

    private Integer eventVisibilityId;
    private String eventVisibilityName;

    private Integer ownerId;
    private String ownerName;
    private String ownerAvatarUrl;

    private String skillLevel;
    private List<String> paymentMethods;
    private String paymentMethod;
    private String imageUrl;

    private Double latitude;
    private Double longitude;

    private Boolean isBanned;
}
