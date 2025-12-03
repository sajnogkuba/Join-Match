package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Integer> {
    List<UserBadge> findUserBadgesByUser(User user);
}
