package com.joinmatch.backend.Service;
import com.joinmatch.backend.dto.AttendanceStatus.AttendanceStatusResponseDto;
import com.joinmatch.backend.model.AttendanceStatus;
import com.joinmatch.backend.repository.AttendanceStatusRepository;
import com.joinmatch.backend.service.AttendanceStatusService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceStatusServiceTest {

    @Mock
    private AttendanceStatusRepository attendanceStatusRepository;

    @InjectMocks
    private AttendanceStatusService attendanceStatusService;

    @Test
    void getAllAttendanceStatuses_shouldReturnMappedDtoList() {
        // given
        AttendanceStatus a1 = new AttendanceStatus(1, "Obecny");
        AttendanceStatus a2 = new AttendanceStatus(2, "Nieobecny");

        when(attendanceStatusRepository.findAll())
                .thenReturn(List.of(a1, a2));

        // when
        List<AttendanceStatusResponseDto> out = attendanceStatusService.getAllAttendanceStatuses();

        // then
        assertEquals(2, out.size());

        assertEquals(1, out.get(0).id());
        assertEquals("Obecny", out.get(0).name());

        assertEquals(2, out.get(1).id());
        assertEquals("Nieobecny", out.get(1).name());

        verify(attendanceStatusRepository).findAll();
    }

    @Test
    void getAllAttendanceStatuses_shouldReturnEmptyList_whenNoStatuses() {
        // given
        when(attendanceStatusRepository.findAll()).thenReturn(List.of());

        // when
        List<AttendanceStatusResponseDto> out = attendanceStatusService.getAllAttendanceStatuses();

        // then
        assertTrue(out.isEmpty());
        verify(attendanceStatusRepository).findAll();
    }
}

