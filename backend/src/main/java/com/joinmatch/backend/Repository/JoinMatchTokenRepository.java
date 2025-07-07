package com.joinmatch.backend.repository;


import com.joinmatch.backend.model.JoinMatchToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinMatchTokenRepository extends JpaRepository<JoinMatchToken,Integer> {
    Optional<List<JoinMatchToken>> getJoinMatchTokenByRefreshToken(String refreshToken);
    Optional<List<JoinMatchToken>> getJoinMatchTokenByUser(User user);
}
