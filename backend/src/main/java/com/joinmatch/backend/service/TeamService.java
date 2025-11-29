package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Reports.TeamReportDto;
import com.joinmatch.backend.dto.Team.CancelTeamRequestDto;
import com.joinmatch.backend.dto.Team.TeamDetailsDto;
import com.joinmatch.backend.dto.Team.TeamRequestDto;
import com.joinmatch.backend.dto.Team.TeamResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.ReportTeamRepository;
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
    private final NotificationService notificationService;
    private final ReportTeamRepository reportTeamRepository;

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

        Page<Team> teams = teamRepository.findAllByLeader(leader, sortedPageable);
        return teams.map(TeamResponseDto::fromTeam);
    }

    public TeamDetailsDto getTeamDetails(Integer teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));
        return TeamDetailsDto.fromTeam(team);
    }

    public Page<TeamResponseDto> findAllByUserId(Pageable pageable, String sortBy, String direction, Integer userId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Page<Team> teams = teamRepository.findAllByUserTeams_UserAndLeaderIsNot(user, user,  sortedPageable);
        return teams.map(TeamResponseDto::fromTeam);
    }

    public void deleteTeam(Integer teamId, CancelTeamRequestDto requestDto) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

        String reason = requestDto != null ? requestDto.reason() : null;
        notificationService.notifyTeamCancellation(team, reason);

        teamRepository.delete(team);
    }

    public TeamResponseDto updateTeam(Integer id, TeamRequestDto teamRequestDto) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + id));
        Sport sport = sportRepository.findById(teamRequestDto.sportTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Sport type not found with id: " + teamRequestDto.sportTypeId()));
        team.setName(teamRequestDto.name());
        team.setCity(teamRequestDto.city());
        team.setSportType(sport);
        team.setDescription(teamRequestDto.description());
        team.setPhotoUrl(teamRequestDto.photoUrl());
        Team updatedTeam = teamRepository.save(team);
        return TeamResponseDto.fromTeam(updatedTeam);
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
        UserTeam userTeam = new UserTeam();
        userTeam.setUser(leader);
        userTeam.setTeam(savedTeam);
        leader.getUserTeams().add(userTeam);
        userRepository.save(leader);
        return TeamResponseDto.fromTeam(savedTeam);
    }

    public void reportUserRating(TeamReportDto teamReportDto) {
        Team team = teamRepository.findById(teamReportDto.IdTeam()).orElseThrow(() -> new IllegalArgumentException());
        User user = userRepository.findByTokenValue(teamReportDto.token()).orElseThrow(() -> new IllegalArgumentException());
        ReportTeam reportTeam = new ReportTeam();
        reportTeam.setTeamReporterUser(user);
        reportTeam.setDescription(teamReportDto.description());
        reportTeam.setActive(false);
        reportTeam.setReviewed(false);
        reportTeam.setTeam(team);
        team.getReportTeamSet().add(reportTeam);
        user.getTeamReportSender().add(reportTeam);
        userRepository.save(user);
        teamRepository.save(team);
        reportTeamRepository.save(reportTeam);
    }
}
