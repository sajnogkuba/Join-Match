package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Friendship;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Integer> {
    List<Friendship> findByUserOneOrUserTwo(User userOne, User userTwo);
    boolean existsByUserOneAndUserTwo(User userOne, User userTwo);
    boolean existsByUserTwoAndUserOne(User userOne, User userTwo);
}
