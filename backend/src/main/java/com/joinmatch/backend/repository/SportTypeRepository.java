package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.SportType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportTypeRepository extends JpaRepository<SportType, Integer> {
}
