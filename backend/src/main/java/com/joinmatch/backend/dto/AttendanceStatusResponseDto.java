package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.AttendanceStatus;

public record AttendanceStatusResponseDto(
        Integer id,
        String name
) {
    public static AttendanceStatusResponseDto fromAttendanceStatus(AttendanceStatus attendanceStatus) {
        return new AttendanceStatusResponseDto(
                attendanceStatus.getId(),
                attendanceStatus.getName()
        );
    }
}
