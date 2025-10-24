package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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
    @Query("select u from User u join u.tokens t " +
            "where t.token = :token and t.revoked = false")
    Optional<User> findByTokenValue(@Param("token") String token);

    @Query("""
    SELECT u FROM User u
    WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))
       OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
""")
    List<User> searchByNameOrEmail(@Param("query") String query);
}
