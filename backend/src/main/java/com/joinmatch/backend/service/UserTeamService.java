package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserTeam.UserTeamResponseDto;
import com.joinmatch.backend.model.UserTeam;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserTeamRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserTeamService {
    private final UserTeamRepository userTeamRepository;
    private final TeamRepository teamRepository;

    public Page<UserTeamResponseDto> findAllByTeamId(Pageable pageable, String sortBy, String direction, Integer teamId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        var team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("Team with id " + teamId + " not found")
        );

        Page<UserTeam> userTeams = userTeamRepository.findAllByTeam(team, sortedPageable);
        return userTeams.map(UserTeamResponseDto::fromUserTeam);
    }
}
