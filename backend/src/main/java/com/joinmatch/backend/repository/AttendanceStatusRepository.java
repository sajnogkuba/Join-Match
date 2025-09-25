package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceStatusRepository extends JpaRepository<AttendanceStatus, Integer> {
}
