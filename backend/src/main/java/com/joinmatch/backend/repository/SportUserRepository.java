package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SportUserRepository extends JpaRepository<SportUser, Integer> {
    SportUser findSportUserByUser(User user);
    @Query("SELECT su FROM SportUser su WHERE su.user.id = :userId AND su.sport.id = :sportId")
    Optional<SportUser> findByUserIdAndSportId(@Param("userId") int userId, @Param("sportId") int sportId);
}
