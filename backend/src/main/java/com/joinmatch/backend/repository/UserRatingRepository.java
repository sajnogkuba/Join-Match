package com.joinmatch.backend.repository;


import com.joinmatch.backend.model.Event;
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

}
