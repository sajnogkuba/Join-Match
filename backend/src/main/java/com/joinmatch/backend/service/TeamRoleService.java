package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamRole.TeamRoleRequestDto;
import com.joinmatch.backend.dto.TeamRole.TeamRoleResponseDto;
import com.joinmatch.backend.dto.TeamRole.TeamRoleUpdateDto;
import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamRole;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.TeamRoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class TeamRoleService {
    private final TeamRoleRepository teamRoleRepository;
    private final TeamRepository teamRepository;

    public List<TeamRoleResponseDto> findAllByTeamId(Integer teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("Team with id " + teamId + " not found")
        );

        List<TeamRole> roles = teamRoleRepository.findAllByTeam(team);
        return roles.stream()
                .map(TeamRoleResponseDto::fromTeamRole)
                .toList();
    }

    @Transactional
    public TeamRoleResponseDto create(TeamRoleRequestDto requestDto) {
        Team team = teamRepository.findById(requestDto.teamId()).orElseThrow(
                () -> new IllegalArgumentException("Team with id " + requestDto.teamId() + " not found")
        );

        if (teamRoleRepository.existsByTeamAndName(team, requestDto.name())) {
            throw new IllegalArgumentException("Role with name '" + requestDto.name() + "' already exists in this team");
        }

        TeamRole teamRole = TeamRole.builder()
                .team(team)
                .name(requestDto.name())
                .build();

        TeamRole savedRole = teamRoleRepository.save(teamRole);
        return TeamRoleResponseDto.fromTeamRole(savedRole);
    }

    @Transactional
    public TeamRoleResponseDto update(Integer roleId, TeamRoleUpdateDto updateDto) {
        TeamRole teamRole = teamRoleRepository.findById(roleId).orElseThrow(
                () -> new IllegalArgumentException("Team role with id " + roleId + " not found")
        );

        if (teamRoleRepository.existsByTeamAndName(teamRole.getTeam(), updateDto.name()) &&
            !teamRole.getName().equals(updateDto.name())) {
            throw new IllegalArgumentException("Role with name '" + updateDto.name() + "' already exists in this team");
        }

        teamRole.setName(updateDto.name());
        TeamRole updatedRole = teamRoleRepository.save(teamRole);
        return TeamRoleResponseDto.fromTeamRole(updatedRole);
    }

    @Transactional
    public void delete(Integer roleId) {
        TeamRole teamRole = teamRoleRepository.findById(roleId).orElseThrow(
                () -> new IllegalArgumentException("Team role with id " + roleId + " not found")
        );
        teamRoleRepository.delete(teamRole);
    }
}
