package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionRequestDto;
import com.joinmatch.backend.dto.TeamPostReaction.TeamPostReactionResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.NotificationService;
import com.joinmatch.backend.service.TeamPostReactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamPostReactionServiceTest {

    @Mock
    private TeamPostReactionRepository reactionRepo;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReactionTypeRepository reactionTypeRepository;

    @Mock
    private TeamPostRepository postRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeamPostReactionService service;

    private TeamPostReactionRequestDto makeDto() {
        return new TeamPostReactionRequestDto(1, 10, 5);
    }

    private User makeUser() {
        User u = new User();
        u.setId(1);
        u.setName("Tester");
        return u;
    }

    private ReactionType makeReactionType() {
        ReactionType r = new ReactionType();
        r.setId(5);
        r.setName("LIKE");
        return r;
    }

    private TeamPost makePost() {
        TeamPost p = new TeamPost();
        p.setPostId(10);
        return p;
    }

    // ----------------------------------------------------
    // CREATE
    // ----------------------------------------------------
    @Test
    void create_shouldSaveReactionAndSendNotification() {
        TeamPostReactionRequestDto dto = makeDto();
        User user = makeUser();
        ReactionType reactionType = makeReactionType();
        TeamPost post = makePost();

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(reactionTypeRepository.findById(5)).thenReturn(Optional.of(reactionType));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));

        TeamPostReaction saved = new TeamPostReaction();
        saved.setId(99);
        saved.setUser(user);
        saved.setPost(post);
        saved.setReactionType(reactionType);

        when(reactionRepo.save(any())).thenReturn(saved);

        TeamPostReactionResponseDto response = service.create(dto);

        assertNotNull(response);
        verify(reactionRepo).save(any());
        verify(notificationService).sendPostReactionNotification(any());
    }

    // ----------------------------------------------------
    // UPDATE
    // ----------------------------------------------------
    @Test
    void update_shouldModifyExistingReaction() {
        TeamPostReactionRequestDto dto = makeDto();
        User user = makeUser();
        ReactionType reactionType = makeReactionType();
        TeamPost post = makePost();

        TeamPostReaction existing = new TeamPostReaction();
        existing.setId(77);
        existing.setUser(user);
        existing.setPost(post);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(reactionRepo.findByUserAndPost(user, post)).thenReturn(Optional.of(existing));
        when(reactionTypeRepository.findById(5)).thenReturn(Optional.of(reactionType));
        when(reactionRepo.save(any())).thenReturn(existing);

        TeamPostReactionResponseDto response = service.update(dto);

        assertNotNull(response);
        verify(notificationService).sendPostReactionNotification(existing);
    }

    @Test
    void update_shouldThrowIfReactionNotFound() {
        TeamPostReactionRequestDto dto = makeDto();
        User user = makeUser();
        TeamPost post = makePost();

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(reactionRepo.findByUserAndPost(user, post)).thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> service.update(dto)
        );
    }

    // ----------------------------------------------------
    // DELETE
    // ----------------------------------------------------
    @Test
    void delete_shouldRemoveReaction() {
        TeamPostReactionRequestDto dto = makeDto();
        User user = makeUser();
        TeamPost post = makePost();

        TeamPostReaction existing = new TeamPostReaction();
        existing.setId(50);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(reactionRepo.findByUserAndPost(user, post)).thenReturn(Optional.of(existing));

        service.delete(dto);

        verify(reactionRepo).delete(existing);
    }

    @Test
    void delete_shouldThrowIfNotFound() {
        TeamPostReactionRequestDto dto = makeDto();
        User user = makeUser();
        TeamPost post = makePost();

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(reactionRepo.findByUserAndPost(user, post)).thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> service.delete(dto)
        );
    }

    // ----------------------------------------------------
    // FIND ALL BY POST
    // ----------------------------------------------------
    @Test
    void findAllByPostId_shouldThrowIfPostMissing() {
        when(postRepository.findById(999)).thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 10);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.findAllByPostId(pageable, "createdAt", "ASC", 999)
        );
    }
}
