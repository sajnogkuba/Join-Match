package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionTypeRepository extends JpaRepository<ReactionType, Integer> {
}
