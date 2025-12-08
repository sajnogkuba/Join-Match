package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostCommentReaction.TeamPostCommentReactionResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.NotificationService;
import com.joinmatch.backend.service.TeamPostCommentReactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamPostCommentReactionServiceTest {

    @Mock
    private TeamPostCommentReactionRepository reactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamPostCommentRepository commentRepository;

    @Mock
    private ReactionTypeRepository reactionTypeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeamPostCommentReactionService service;


    // -------------------------------------------------------
    // create()
    // -------------------------------------------------------
    @Test
    void create_shouldSaveReactionAndSendNotification() {
        TeamPostCommentReactionRequestDto dto = new TeamPostCommentReactionRequestDto(1, 10, 5);

        User user = new User();
        user.setId(1);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        ReactionType type = new ReactionType();
        type.setId(5);

        TeamPostCommentReaction saved = new TeamPostCommentReaction();
        saved.setId(100);
        saved.setUser(user);
        saved.setComment(comment);
        saved.setReactionType(type);
        saved.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(commentRepository.findById(10)).thenReturn(Optional.of(comment));
        when(reactionTypeRepository.findById(5)).thenReturn(Optional.of(type));
        when(reactionRepository.save(any())).thenReturn(saved);

        TeamPostCommentReactionResponseDto response = service.create(dto);

        assertEquals(100, response.id());
        verify(notificationService).sendCommentReactionNotification(any());
    }


    // -------------------------------------------------------
    // update()
    // -------------------------------------------------------
    @Test
    void update_shouldModifyExistingReaction() {
        TeamPostCommentReactionRequestDto dto = new TeamPostCommentReactionRequestDto(1, 10, 3);

        User user = new User();
        user.setId(1);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        ReactionType newType = new ReactionType();
        newType.setId(3);

        TeamPostCommentReaction existing = new TeamPostCommentReaction();
        existing.setId(55);
        existing.setUser(user);
        existing.setComment(comment);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(commentRepository.findById(10)).thenReturn(Optional.of(comment));
        when(reactionRepository.findByUserAndComment(user, comment)).thenReturn(Optional.of(existing));
        when(reactionTypeRepository.findById(3)).thenReturn(Optional.of(newType));
        when(reactionRepository.save(existing)).thenReturn(existing);

        TeamPostCommentReactionResponseDto result = service.update(dto);

        assertEquals(55, result.id());
        assertEquals(3, result.reactionType().id());
        verify(notificationService).sendCommentReactionNotification(existing);
    }


    @Test
    void update_shouldThrowIfReactionNotExists() {
        TeamPostCommentReactionRequestDto dto = new TeamPostCommentReactionRequestDto(1, 10, 3);

        User user = new User();
        user.setId(1);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(commentRepository.findById(10)).thenReturn(Optional.of(comment));
        when(reactionRepository.findByUserAndComment(user, comment)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.update(dto));
    }


    // -------------------------------------------------------
    // delete()
    // -------------------------------------------------------
    @Test
    void delete_shouldRemoveReaction() {
        TeamPostCommentReactionRequestDto dto = new TeamPostCommentReactionRequestDto(1, 10, 2);

        User user = new User();
        user.setId(1);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        TeamPostCommentReaction reaction = new TeamPostCommentReaction();
        reaction.setId(111);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(commentRepository.findById(10)).thenReturn(Optional.of(comment));
        when(reactionRepository.findByUserAndComment(user, comment)).thenReturn(Optional.of(reaction));

        service.delete(dto);

        verify(reactionRepository).delete(reaction);
    }


    // -------------------------------------------------------
    // findAllByCommentId()
    // -------------------------------------------------------
    @Test
    void findAllByCommentId_shouldReturnPagedResults() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id"));
        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        TeamPostCommentReaction reaction = new TeamPostCommentReaction();
        reaction.setId(1);

        Page<TeamPostCommentReaction> page = new PageImpl<>(List.of(reaction));

        when(commentRepository.findById(10)).thenReturn(Optional.of(comment));
        when(reactionRepository.findAllByComment(eq(comment), any(Pageable.class)))
                .thenReturn(page);

        var result = service.findAllByCommentId(pageable, "id", "ASC", 10);

        assertEquals(1, result.getTotalElements());
    }


    // -------------------------------------------------------
    // getUserReactionsBatch()
    // -------------------------------------------------------
    @Test
    void getUserReactionsBatch_shouldReturnMappedReactions() {
        List<Integer> commentIds = List.of(10, 11, 12);

        User user = new User();
        user.setId(1);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(10);

        ReactionType type = new ReactionType();
        type.setId(3);

        TeamPostCommentReaction reaction = new TeamPostCommentReaction();
        reaction.setComment(comment);
        reaction.setReactionType(type);

        when(reactionRepository.findByComment_CommentIdInAndUser_Id(commentIds, 1))
                .thenReturn(List.of(reaction));

        Map<Integer, Integer> result = service.getUserReactionsBatch(commentIds, 1);

        assertEquals(1, result.size());
        assertEquals(3, result.get(10));
    }


    @Test
    void getUserReactionsBatch_shouldReturnEmptyMapForEmptyInput() {
        Map<Integer, Integer> result = service.getUserReactionsBatch(List.of(), 1);
        assertTrue(result.isEmpty());
    }
}
