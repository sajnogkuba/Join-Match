package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Sport;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Integer> {
    Optional<Sport> findSportById(int id);
}
