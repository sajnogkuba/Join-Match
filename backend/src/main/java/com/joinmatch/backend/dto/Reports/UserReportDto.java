package com.joinmatch.backend.dto.Reports;

public record UserReportDto(String token, Integer reportedUserId, String description) {
}
