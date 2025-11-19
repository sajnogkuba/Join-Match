package com.joinmatch.backend.dto.Reports;

import software.amazon.awssdk.services.s3.endpoints.internal.Value;

public record EventReportDto(String token, Integer idEvent, String description) {
}
