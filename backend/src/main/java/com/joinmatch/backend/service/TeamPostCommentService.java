package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.TeamPostComment.TeamPostCommentResponseDto;
import com.joinmatch.backend.model.TeamPostComment;
import com.joinmatch.backend.repository.TeamPostCommentRepository;
import com.joinmatch.backend.repository.TeamPostRepository;
import com.joinmatch.backend.repository.UserRepository;
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
public class TeamPostCommentService {
    private final TeamPostCommentRepository teamPostCommentRepository;
    private final TeamPostRepository teamPostRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeamPostCommentResponseDto createComment(TeamPostCommentResponseDto dto) {
        TeamPostComment teamPostComment = new TeamPostComment();
        return getTeamPostCommentResponseDto(dto, teamPostComment);
    }

    private TeamPostCommentResponseDto getTeamPostCommentResponseDto(TeamPostCommentResponseDto dto, TeamPostComment teamPostComment) {
        var post = teamPostRepository.findById(dto.postId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        var author = userRepository.findById(dto.authorId())
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));

        teamPostComment.setPost(post);
        teamPostComment.setAuthor(author);
        teamPostComment.setContent(dto.content());
        teamPostComment.setIsDeleted(false);
        teamPostComment.setCreatedAt(LocalDateTime.now());
        teamPostComment.setUpdatedAt(LocalDateTime.now());
        if (dto.parentCommentId() != null) {
            var parentComment = teamPostCommentRepository.findById(dto.parentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found with ID: " + dto.parentCommentId()));
            teamPostComment.setParentComment(parentComment);
        }
        TeamPostComment saved = teamPostCommentRepository.save(teamPostComment);
        return TeamPostCommentResponseDto.fromEntity(saved);
    }

    public Page<TeamPostCommentResponseDto> findAllByPostId(Pageable pageable, String sortBy, String direction, Integer postId) {
        Sort sort = Sort.by(new Sort.Order(
                Sort.Direction.fromString(direction),
                sortBy
        ).ignoreCase());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        var posts = teamPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId));

        Page<TeamPostComment> comments = teamPostCommentRepository.findAllByPost(posts, sortedPageable);
        return comments.map(TeamPostCommentResponseDto::fromEntity);
    }
}
