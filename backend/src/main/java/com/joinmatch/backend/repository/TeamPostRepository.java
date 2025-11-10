package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamPostRepository extends JpaRepository<TeamPost, Integer>, JpaSpecificationExecutor<TeamPost> {
    Page<TeamPost> findAllByTeam(Team team, Pageable sortedPageable);
}
