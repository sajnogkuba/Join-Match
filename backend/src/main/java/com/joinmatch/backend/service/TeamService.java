package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamRequestDto;
import com.joinmatch.backend.dto.TeamResponseDto;
import com.joinmatch.backend.model.Sport;
import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.SportRepository;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeamResponseDto create(TeamRequestDto teamRequestDto) {
        if (teamRepository.existsByName((teamRequestDto.name()))) {
            throw new IllegalArgumentException("Team with this name already exists");
        }

        Team team = new Team();
        return getTeamResponseDto(teamRequestDto, team);
    }

    private TeamResponseDto getTeamResponseDto(TeamRequestDto teamRequestDto, Team team) {
        Sport sport = sportRepository.findById(teamRequestDto.sportTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Sport type not found with id: " + teamRequestDto.sportTypeId()));
        User leader = userRepository.findById(teamRequestDto.leaderId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + teamRequestDto.leaderId()));
        team.setName(teamRequestDto.name());
        team.setCity(teamRequestDto.city());
        team.setDescription(teamRequestDto.description());
        team.setPhotoUrl(teamRequestDto.photoUrl());
        team.setSportType(sport);
        team.setLeader(leader);
        Team savedTeam = teamRepository.save(team);
        return TeamResponseDto.fromTeam(savedTeam);
    }
}
