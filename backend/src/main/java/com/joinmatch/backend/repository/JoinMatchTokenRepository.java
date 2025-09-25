package com.joinmatch.backend.repository;


import com.joinmatch.backend.model.JoinMatchToken;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JoinMatchTokenRepository extends JpaRepository<JoinMatchToken,Integer> {
    Optional<List<JoinMatchToken>> getJoinMatchTokenByRefreshToken(String refreshToken);
    Optional<List<JoinMatchToken>> getJoinMatchTokenByUser(User user);
    Optional<JoinMatchToken> getJoinMatchTokenByToken(String token);

//    @Query("""
//    select t from JoinMatchToken t
//    join t.user u
//    left join fetch u.sportUsers su
//    left join fetch su.sport s
//    where t.token = :token
//    """)
//        Optional<JoinMatchToken> findByTokenFetchSports(@Param("token") String token);


}
