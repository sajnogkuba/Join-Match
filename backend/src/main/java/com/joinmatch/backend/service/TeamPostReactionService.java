package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionResponseDto;
import com.joinmatch.backend.model.TeamPostReaction;
import com.joinmatch.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class TeamPostReactionService {
    private final TeamPostReactionRepository teamPostReactionRepository;
    private final UserRepository userRepository;
    private final ReactionTypeRepository reactionTypeRepository;
    private final TeamPostRepository teamPostRepository;

    @Transactional
    public TeamPostReactionResponseDto create(TeamPostReactionRequestDto dto) {
        TeamPostReaction reaction = new TeamPostReaction();
        return getTeamPostReaction(dto, reaction);
    }

    @Transactional
    public TeamPostReactionResponseDto update(TeamPostReactionRequestDto dto) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var post = teamPostRepository.findById(dto.postId())
                .orElseThrow(() -> new IllegalArgumentException("Post with id " + dto.postId() + " not found"));
        var reaction = teamPostReactionRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new IllegalArgumentException("Reaction by user with id " + dto.userId() + " on post with id " + dto.postId() + " not found"));
        return getTeamPostReaction(dto, reaction);

    }

    @Transactional
    public void delete(TeamPostReactionRequestDto dto) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var post = teamPostRepository.findById(dto.postId())
                .orElseThrow(() -> new IllegalArgumentException("Post with id " + dto.postId() + " not found"));
        var reaction = teamPostReactionRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new IllegalArgumentException("Reaction by user with id " + dto.userId() + " on post with id " + dto.postId() + " not found"));
        teamPostReactionRepository.delete(reaction);
    }

    public Page<TeamPostReactionResponseDto> findAllByPostId(Pageable pageable, String sortBy, String direction, Integer postId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        var post = teamPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with id " + postId + " not found"));
        Page<TeamPostReaction> reactions = teamPostReactionRepository.findAllByPost(post, sortedPageable);
        return reactions.map(TeamPostReactionResponseDto::fromEntity);
    }

    private TeamPostReactionResponseDto getTeamPostReaction(TeamPostReactionRequestDto dto, TeamPostReaction reaction) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var reactionType = reactionTypeRepository.findById(dto.reactionTypeId())
                .orElseThrow(() -> new IllegalArgumentException("ReactionType with id " + dto.reactionTypeId() + " not found"));
        var post = teamPostRepository.findById(dto.postId())
                .orElseThrow(() -> new IllegalArgumentException("Post with id " + dto.postId() + " not found"));
        reaction.setUser(user);
        reaction.setReactionType(reactionType);
        reaction.setPost(post);
        reaction.setCreatedAt(LocalDateTime.now());
        TeamPostReaction savedReaction = teamPostReactionRepository.save(reaction);
        return TeamPostReactionResponseDto.fromEntity(savedReaction);
    }
}
