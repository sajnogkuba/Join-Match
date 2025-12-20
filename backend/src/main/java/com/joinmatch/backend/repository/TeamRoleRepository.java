package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRoleRepository extends JpaRepository<TeamRole, Integer> {
    List<TeamRole> findAllByTeam(Team team);
    boolean existsByTeamAndName(Team team, String name);
}
