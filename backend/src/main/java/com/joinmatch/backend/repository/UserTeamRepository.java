package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.UserTeam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserTeamRepository extends JpaRepository<UserTeam, Integer>, JpaSpecificationExecutor<UserTeam> {
    Page<UserTeam> findAllByTeam(Team team, Pageable pageable);
}
