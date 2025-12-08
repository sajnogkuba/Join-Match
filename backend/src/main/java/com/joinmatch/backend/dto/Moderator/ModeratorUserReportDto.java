package com.joinmatch.backend.dto.Moderator;

public record ModeratorUserReportDto(
                                      Integer id,
                                      Integer reportedUserId,
                                      String reportedUserEmail,
                                      String reportedUsername,
                                      String reportedUserAvatarUrl,
                                      Integer reporterUserId,
                                      String reporterUserEmail,
                                      String reporterUsername,
                                      String reporterAvatarUrl,
                                      String description,
                                      boolean active,
                                      boolean viewed
){}
