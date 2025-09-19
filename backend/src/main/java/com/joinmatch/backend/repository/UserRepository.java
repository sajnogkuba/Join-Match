package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> getUserById(Integer id);
    @Query("""
        select distinct u
        from JoinMatchToken t
        join t.user u
        left join fetch u.sportUsers su
        left join fetch su.sport s
        where t.token = :token
    """)
    Optional<User> findUserWithSportsByToken(@Param("token") String token);
}
