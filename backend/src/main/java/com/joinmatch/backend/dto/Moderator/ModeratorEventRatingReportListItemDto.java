package com.joinmatch.backend.dto.Moderator;

import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.time.LocalDateTime;

public record ModeratorEventRatingReportListItemDto(Integer id,
                                                    String description,

                                                    Integer reporterId,
                                                    String userEmail,
                                                    String reporterUsername,
                                                    String reporterAvatarUrl,

                                                    Integer eventId,
                                                    String eventName,
                                                    String eventImageUrl,
                                                    Integer idRater,
                                                    Integer rate,
                                                    String commentRate,
                                                    boolean viewed,
                                                    boolean active) {
}
