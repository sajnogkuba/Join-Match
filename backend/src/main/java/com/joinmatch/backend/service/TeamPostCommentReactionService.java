package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionResponseDto;
import com.joinmatch.backend.model.TeamPostCommentReaction;
import com.joinmatch.backend.repository.ReactionTypeRepository;
import com.joinmatch.backend.repository.TeamPostCommentReactionRepository;
import com.joinmatch.backend.repository.TeamPostCommentRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TeamPostCommentReactionService {
    private final TeamPostCommentReactionRepository teamPostCommentReactionRepository;
    private final UserRepository userRepository;
    private final TeamPostCommentRepository teamPostCommentRepository;
    private final ReactionTypeRepository reactionTypeRepository;
    private final NotificationService notificationService;

    @Transactional
    public TeamPostCommentReactionResponseDto create(TeamPostCommentReactionRequestDto dto) {
        TeamPostCommentReaction reaction = new TeamPostCommentReaction();
        var responseDto = getTeamPostCommentReaction(dto, reaction);
        notificationService.sendCommentReactionNotification(reaction);
        return responseDto;
    }

    public Page<TeamPostCommentReactionResponseDto> findAllByCommentId(Pageable pageable, String sortBy, String direction, Integer commentId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        var comment = teamPostCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment with id " + commentId + " not found"));
        Page<TeamPostCommentReaction> reactions = teamPostCommentReactionRepository.findAllByComment(comment, sortedPageable);
        return reactions.map(TeamPostCommentReactionResponseDto::fromEntity);
    }

    @Transactional
    public TeamPostCommentReactionResponseDto update(TeamPostCommentReactionRequestDto dto) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var comment = teamPostCommentRepository.findById(dto.commentId())
                .orElseThrow(() -> new IllegalArgumentException("Comment with id " + dto.commentId() + " not found"));
        var reaction = teamPostCommentReactionRepository.findByUserAndComment(user, comment)
                .orElseThrow(() -> new IllegalArgumentException("Reaction by user with id " + dto.userId() + " on comment with id " + dto.commentId() + " not found"));
        var responseDto = getTeamPostCommentReaction(dto, reaction);
        notificationService.sendCommentReactionNotification(reaction);
        return responseDto;
    }

    @Transactional
    public void delete(TeamPostCommentReactionRequestDto dto) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var comment = teamPostCommentRepository.findById(dto.commentId())
                .orElseThrow(() -> new IllegalArgumentException("Comment with id " + dto.commentId() + " not found"));
        var reaction = teamPostCommentReactionRepository.findByUserAndComment(user, comment)
                .orElseThrow(() -> new IllegalArgumentException("Reaction by user with id " + dto.userId() + " on comment with id " + dto.commentId() + " not found"));
        teamPostCommentReactionRepository.delete(reaction);
    }

    public Map<Integer, Integer> getUserReactionsBatch(List<Integer> commentIds, Integer userId) {
        if (commentIds == null || commentIds.isEmpty()) {
            return new HashMap<>();
        }
        
        List<TeamPostCommentReaction> reactions = teamPostCommentReactionRepository
                .findByComment_CommentIdInAndUser_Id(commentIds, userId);
        
        Map<Integer, Integer> result = new HashMap<>();
        for (TeamPostCommentReaction reaction : reactions) {
            result.put(reaction.getComment().getCommentId(), reaction.getReactionType().getId());
        }
        
        return result;
    }

    private TeamPostCommentReactionResponseDto getTeamPostCommentReaction(TeamPostCommentReactionRequestDto dto, TeamPostCommentReaction reaction) {
        var user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.userId() + " not found"));
        var comment = teamPostCommentRepository.findById(dto.commentId())
                .orElseThrow(() -> new IllegalArgumentException("Comment with id " + dto.commentId() + " not found"));
        var reactionType = reactionTypeRepository.findById(dto.reactionTypeId())
                .orElseThrow(() -> new IllegalArgumentException("ReactionType with id " + dto.reactionTypeId() + " not found"));
        reaction.setUser(user);
        reaction.setComment(comment);
        reaction.setReactionType(reactionType);
        reaction.setCreatedAt(LocalDateTime.now());
        var saved = teamPostCommentReactionRepository.save(reaction);
        return TeamPostCommentReactionResponseDto.fromEntity(saved);
    }
}
