package com.joinmatch.backend.Repository;

import com.joinmatch.backend.Model.JoinMatchToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinMatchTokenRepository extends JpaRepository<JoinMatchToken,Integer> {
    Optional<List<JoinMatchToken>> getJoinMatchTokenByRefreshToken(String refreshToken);
}
