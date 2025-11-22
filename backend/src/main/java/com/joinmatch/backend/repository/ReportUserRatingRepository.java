package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReportUserRating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportUserRatingRepository extends JpaRepository<ReportUserRating, Integer> {
    long countByReviewedIsFalse();
}
