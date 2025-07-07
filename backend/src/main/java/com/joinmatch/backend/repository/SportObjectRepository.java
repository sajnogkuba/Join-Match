package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.SportObject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportObjectRepository extends JpaRepository<SportObject, Integer> {
}
