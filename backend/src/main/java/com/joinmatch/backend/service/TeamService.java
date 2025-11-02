package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamDetailsDto;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public Page<TeamResponseDto> findAll(Pageable pageable, String sortBy, String direction) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Team> teams = teamRepository.findAll(sortedPageable);
        return teams.map(TeamResponseDto::fromTeam);
    }

    public Page<TeamResponseDto> findAllByLeaderId(Pageable pageable, String sortBy, String direction, Integer leaderId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + leaderId));

        Page<Team> teams = teamRepository.findByLeader(leader, sortedPageable);
        return teams.map(TeamResponseDto::fromTeam);
    }

    public TeamDetailsDto getTeamDetails(Integer teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));
        return TeamDetailsDto.fromTeam(team);
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
