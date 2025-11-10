package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.UserTeam.UserTeamResponseDto;
import com.joinmatch.backend.model.UserTeam;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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

    public void removeUserFromTeam(Integer teamId, Integer userId, String reason) {
        var team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("Team with id " + teamId + " not found")
        );

        var user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("User with id " + userId + " not found")
        );

        var userTeam = userTeamRepository.findByUserAndTeam(user, team).orElseThrow(
                () -> new IllegalArgumentException("User with id " + userId + " is not a member of team with id " + teamId)
        );

        var leader = team.getLeader();
        if (leader.getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove the leader of the team");
        }
        userTeamRepository.delete(userTeam);
        notificationService.sendTeamMemberRemovedNotification(userTeam, reason);
    }

    public void quitFromTeam(Integer teamId, Integer userId, String reason) {
        var team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("Team with id " + teamId + " not found")
        );

        var user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("User with id " + userId + " not found")
        );

        var userTeam = userTeamRepository.findByUserAndTeam(user, team).orElseThrow(
                () -> new IllegalArgumentException("User with id " + userId + " is not a member of team with id " + teamId)
        );

        var leader = team.getLeader();
        if (leader.getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove the leader of the team");
        }

        userTeamRepository.delete(userTeam);

        notificationService.sendTeamLeftNotification(userTeam);
    }
}
