package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Integer> {
    List<UserBadge> findUserBadgesByUser(User user);

    @Query("""
        SELECT u.id, u.name, u.email, u.urlOfPicture,
               COUNT(ub.id) as badgeCount
        FROM User u
        LEFT JOIN UserBadge ub ON ub.user.id = u.id
        LEFT JOIN Badge b ON ub.badge.id = b.id
        WHERE u.isBlocked = false
          AND u.isVerified = true
          AND (b.active = true OR b.active IS NULL)
        GROUP BY u.id, u.name, u.email, u.urlOfPicture
        HAVING COUNT(ub.id) > 0
        ORDER BY badgeCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopUsersByBadgeCount(@Param("limit") Integer limit);
}
