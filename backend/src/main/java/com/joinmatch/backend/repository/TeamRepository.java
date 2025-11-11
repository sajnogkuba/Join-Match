package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;

public interface TeamRepository extends JpaRepository<Team, Integer>, JpaSpecificationExecutor<Team> {
    boolean existsByName(String name);

    Page<Team> findAllByLeader(User leader, Pageable pageable);

    Page<Team> findAllByUserTeams_UserAndLeaderIsNot(User userTeamsUser, User leader, Pageable pageable);
}
