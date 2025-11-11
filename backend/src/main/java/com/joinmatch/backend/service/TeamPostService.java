package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamPost.TeamPostRequestDto;
import com.joinmatch.backend.dto.TeamPost.TeamPostResponseDto;
import com.joinmatch.backend.enums.PostType;
import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamPost;
import com.joinmatch.backend.model.TeamPostMention;
import com.joinmatch.backend.repository.TeamPostRepository;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public TeamPostResponseDto update(Integer postId, TeamPostRequestDto teamPostRequestDto) {
        var post = teamPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Team post with ID " + postId + " does not exist."));
        return getTeamPostResponseDto(teamPostRequestDto, post);
    }


    public Page<TeamPostResponseDto> findAllByTeamId(Pageable pageable, String sortBy, String direction, Integer teamId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team with ID " + teamId + " does not exist."));
        Page<TeamPost> posts = teamPostRepository.findAllByTeam(team, sortedPageable);
        return posts.map(TeamPostResponseDto::fromEntity);
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
        if (teamPostRequestDto.mentionedUserIds() != null && !teamPostRequestDto.mentionedUserIds().isEmpty()) {
            var mentions = teamPostRequestDto.mentionedUserIds().stream()
                    .map(userId -> {
                        var mentionedUser = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("Mentioned user with ID " + userId + " does not exist."));
                        var mention = new TeamPostMention();
                        mention.setPost(teamPost);
                        mention.setMentionedUser(mentionedUser);
                        return mention;
                    })
                    .collect(Collectors.toList());

            teamPost.setMentions(mentions);
        }
        return TeamPostResponseDto.fromEntity(savedPost);
    }

    public void delete(Integer postId) {
        var post = teamPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Team post with ID " + postId + " does not exist."));
        teamPostRepository.delete(post);
    }

    public void restore(Integer postId) {
        var post = teamPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Team post with ID " + postId + " does not exist."));
        post.setIsDeleted(false);
        post.setDeletedAt(null);
        teamPostRepository.save(post);
    }
}
