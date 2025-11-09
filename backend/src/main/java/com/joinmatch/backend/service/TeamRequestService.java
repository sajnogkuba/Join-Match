package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamRequestResponseDto;
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

    public Page<TeamRequestResponseDto> findAll(Pageable pageable, String sortBy, String direction) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<TeamRequest> teamRequests = teamRequestRepository.findAll(sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }

    public Page<TeamRequestResponseDto> findAllByTeamId(Pageable pageable, String sortBy, String direction, Integer teamId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

        Page<TeamRequest> teamRequests = teamRequestRepository.findAllByTeam(team, sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }

    public Page<TeamRequestResponseDto> findAllByReceiverId(Pageable pageable, String sortBy, String direction, Integer receiverId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        var receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + receiverId));

        Page<TeamRequest> teamRequests = teamRequestRepository.findAllByReceiver(receiver, sortedPageable);
        return teamRequests.map(TeamRequestResponseDto::fromTeamRequest);
    }


}
