package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.TeamPost;
import com.joinmatch.backend.model.TeamPostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamPostCommentRepository extends JpaRepository<TeamPostComment, Integer>, JpaSpecificationExecutor<TeamPostComment> {
    @EntityGraph(attributePaths = {"reactions", "reactions.reactionType"})
    Page<TeamPostComment> findAllByPost(TeamPost post, Pageable pageable);
}
