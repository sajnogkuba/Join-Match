package com.joinmatch.backend.repository;


import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRatingRepository extends JpaRepository<UserRating, Integer> {
    List<UserRating> findByRated_Id(Integer ratedId);
    @Query("SELECT AVG(r.rating) FROM UserRating r WHERE r.rated.id = :userId")
    Double getAverageUserRating(@Param("userId") Integer userId);
    boolean existsByRaterAndRated(User rater, User rated);

    @Query("""
    SELECT u.id, u.name, u.email, u.urlOfPicture, 
           COALESCE(AVG(ur.rating), 0.0) as avgRating,
           COUNT(ur.userRateId) as totalRatings
    FROM User u
    LEFT JOIN UserRating ur ON ur.rated.id = u.id
    WHERE u.isBlocked = false AND u.isVerified = true
    GROUP BY u.id, u.name, u.email, u.urlOfPicture
    HAVING COUNT(ur.userRateId) >= :minRatings
    ORDER BY avgRating DESC, totalRatings DESC
    LIMIT :limit
""")
    List<Object[]> findTopUsersByRating(@Param("limit") Integer limit, @Param("minRatings") Integer minRatings);

}
