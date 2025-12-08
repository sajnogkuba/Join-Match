package com.joinmatch.backend.dto.Moderator;


import software.amazon.awssdk.services.s3.endpoints.internal.Value;

public record UserRateReportDto(
        Integer id,
        Integer rateId,
        String rateDescription,
        Integer numberOfStars,
        Integer ratedUserId,
        String ratedUserEmail,
        String ratedUserUsername,
        String ratedUserAvatar,
        Integer reporterUserId,
        String reporterUserEmail,
        String reporterUsername,
        String reporterAvatar,
        String description,
        boolean active,
        boolean reviewed
) {
}

