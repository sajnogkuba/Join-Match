package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportEvent;
import com.joinmatch.backend.model.ReportEventRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportEventRatingRepository extends JpaRepository<ReportEventRating, Integer> {
    long countByReviewedIsFalse();
    Page<ReportEventRating> findAllByOrderByIdDesc(Pageable pageable);

}
