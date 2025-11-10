package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.TeamPostCommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamPostCommentReactionRepository extends JpaRepository<TeamPostCommentReaction, Integer> {
}
