package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamPost.TeamPostRequestDto;
import com.joinmatch.backend.dto.TeamPost.TeamPostResponseDto;
import com.joinmatch.backend.enums.PostType;
import com.joinmatch.backend.model.TeamPost;
import com.joinmatch.backend.model.TeamPostMention;
import com.joinmatch.backend.repository.TeamPostRepository;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TeamPostService {
    private final TeamPostRepository teamPostRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public TeamPostResponseDto create(TeamPostRequestDto teamPostRequestDto) {
        TeamPost teamPost = new TeamPost();
        return getTeamPostResponseDto(teamPostRequestDto, teamPost);
    }

    private TeamPostResponseDto getTeamPostResponseDto(TeamPostRequestDto teamPostRequestDto, TeamPost teamPost) {
        var team = teamRepository.findById(teamPostRequestDto.teamId())
                .orElseThrow(() -> new IllegalArgumentException("Team with ID " + teamPostRequestDto.teamId() + " does not exist."));
        var author = userRepository.findById(teamPostRequestDto.authorId())
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + teamPostRequestDto.authorId() + " does not exist."));
        teamPost.setTeam(team);
        teamPost.setAuthor(author);
        teamPost.setContent(teamPostRequestDto.content());
        teamPost.setContentHtml(teamPostRequestDto.contentHtml());
        teamPost.setPostType(teamPostRequestDto.postType() != null ? teamPostRequestDto.postType() : PostType.TEXT);
        TeamPost savedPost = teamPostRepository.save(teamPost);
        teamPost.setCreatedAt(LocalDateTime.now());
        teamPost.setUpdatedAt(LocalDateTime.now());
        if (teamPostRequestDto.mentionedUserIds() != null && !teamPostRequestDto.mentionedUserIds().isEmpty()) {
            var mentions = teamPostRequestDto.mentionedUserIds().stream()
                    .map(userId -> {
                        var mentionedUser = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("Mentioned user with ID " + userId + " does not exist."));
                        var mention = new TeamPostMention();
                        mention.setPost(teamPost);
                        mention.setMentionedUser(mentionedUser);
                        mention.setCreatedAt(LocalDateTime.now());
                        return mention;
                    })
                    .collect(Collectors.toList());

            teamPost.setMentions(mentions);
        }
        return TeamPostResponseDto.fromEntity(savedPost);
    }
}
