package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.TeamPostComment;
import com.joinmatch.backend.model.TeamPostCommentReaction;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamPostCommentReactionRepository extends JpaRepository<TeamPostCommentReaction, Integer> {
    Page<TeamPostCommentReaction> findAllByComment_CommentId(Integer commentId, Pageable pageable);

    Optional<TeamPostCommentReaction> findByUserAndComment(User user, TeamPostComment comment);

    Page<TeamPostCommentReaction> findAllByComment(TeamPostComment comment, Pageable sortedPageable);
}
