package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.TeamPost;
import com.joinmatch.backend.model.TeamPostReaction;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamPostReactionRepository extends JpaRepository<TeamPostReaction, Integer> {
    Optional<TeamPostReaction> findByUserAndPost(User user, TeamPost post);

    Page<TeamPostReaction> findAllByPost(TeamPost post, Pageable sortedPageable);
}
