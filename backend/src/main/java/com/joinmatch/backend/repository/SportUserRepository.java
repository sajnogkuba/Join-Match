package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportUserRepository extends JpaRepository<SportUser, Integer> {
    SportUser findSportUserByUser(User user);
}
