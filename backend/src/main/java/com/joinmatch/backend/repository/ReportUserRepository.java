package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportUserRepository extends JpaRepository<ReportUser, Integer> {
    long countByReviewedIsFalse();
    Page<ReportUser> findAllByOrderByIdDesc(Pageable pageable);
}
