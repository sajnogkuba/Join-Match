package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.AttendanceStatus.AttendanceStatusResponseDto;
import com.joinmatch.backend.repository.AttendanceStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceStatusService {
    private final AttendanceStatusRepository attendanceStatusRepository;

    public List<AttendanceStatusResponseDto> getAllAttendanceStatuses() {
        return attendanceStatusRepository.findAll()
                .stream()
                .map(AttendanceStatusResponseDto::fromAttendanceStatus)
                .toList();
    }
}
