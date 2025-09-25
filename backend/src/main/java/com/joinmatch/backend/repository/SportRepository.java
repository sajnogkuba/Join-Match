package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Sport;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportRepository extends JpaRepository<Sport, Integer> {
}
