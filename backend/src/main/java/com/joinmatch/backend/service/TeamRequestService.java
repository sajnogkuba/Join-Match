package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamRequest.TeamRequestRequestDto;
import com.joinmatch.backend.dto.TeamRequest.TeamRequestResponseDto;
import com.joinmatch.backend.enums.TeamRequestStatus;
import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamRequest;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.TeamRequestRepository;
import com.joinmatch.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TeamRequestService {
    private final TeamRequestRepository teamRequestRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public Page<TeamRequestResponseDto> findAll(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        Page<TeamRequest> teamRequests = teamRequestRepository.findAll(sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }

    public Page<TeamRequestResponseDto> findAllByTeamId(Pageable pageable, Integer teamId) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

        Page<TeamRequest> teamRequests = teamRequestRepository.findAllByTeam(team, sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }

    public Page<TeamRequestResponseDto> findAllByReceiverId(Pageable pageable, Integer receiverId) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        var receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + receiverId));

        Page<TeamRequest> teamRequests = teamRequestRepository.findAllByReceiver(receiver, sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }


    public TeamRequestResponseDto create(TeamRequestRequestDto dto) {
        var team = teamRepository.findById(dto.teamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + dto.teamId()));

        var receiver = userRepository.findById(dto.receiverId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + dto.receiverId()));

        TeamRequest teamRequest = new TeamRequest();
        teamRequest.setTeam(team);
        teamRequest.setReceiver(receiver);
        teamRequest.setStatus(TeamRequestStatus.PENDING);

        TeamRequest savedRequest = teamRequestRepository.save(teamRequest);
        return TeamRequestResponseDto.fromTeamRequest(savedRequest);
    }
}
