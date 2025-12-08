package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.TeamPost.TeamPostRequestDto;
import com.joinmatch.backend.dto.TeamPost.TeamPostResponseDto;
import com.joinmatch.backend.enums.PostType;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.TeamPostRepository;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.TeamPostService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamPostServiceTest {

    @Mock
    private TeamPostRepository postRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private TeamRepository teamRepo;

    @InjectMocks
    private TeamPostService service;

    private Team makeTeam() {
        Team t = new Team();
        t.setId(100);
        return t;
    }

    private User makeUser() {
        User u = new User();
        u.setId(7);
        u.setName("Tester");
        return u;
    }

    private TeamPostRequestDto makeDto() {
        return new TeamPostRequestDto(
                100,           // teamId
                7,             // authorId
                "content",
                "<p>content</p>",
                PostType.TEXT,
                List.of(11, 22)
        );
    }

    // ------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------
    @Test
    void create_shouldSavePostAndReturnDto() {
        Team team = makeTeam();
        User user = makeUser();
        TeamPostRequestDto dto = makeDto();
        TeamPost saved = new TeamPost();
        saved.setPostId(1);

        when(teamRepo.findById(100)).thenReturn(Optional.of(team));
        when(userRepo.findById(7)).thenReturn(Optional.of(user));
        when(userRepo.findById(11)).thenReturn(Optional.of(new User()));
        when(userRepo.findById(22)).thenReturn(Optional.of(new User()));
        when(postRepo.save(any())).thenReturn(saved);

        TeamPostResponseDto response = service.create(dto);

        assertNotNull(response);
        verify(postRepo).save(any());
    }

    @Test
    void create_shouldThrowIfTeamNotFound() {
        when(teamRepo.findById(100)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.create(makeDto()));
    }

    @Test
    void create_shouldThrowIfAuthorNotFound() {
        when(teamRepo.findById(100)).thenReturn(Optional.of(makeTeam()));
        when(userRepo.findById(7)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.create(makeDto()));
    }

    // ------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------
    @Test
    void update_shouldModifyExistingPost() {
        TeamPost existing = new TeamPost();
        existing.setPostId(1);

        when(postRepo.findById(1)).thenReturn(Optional.of(existing));
        when(teamRepo.findById(100)).thenReturn(Optional.of(makeTeam()));
        when(userRepo.findById(7)).thenReturn(Optional.of(makeUser()));
        when(userRepo.findById(11)).thenReturn(Optional.of(new User()));
        when(userRepo.findById(22)).thenReturn(Optional.of(new User()));
        when(postRepo.save(any())).thenReturn(existing);

        TeamPostResponseDto response = service.update(1, makeDto());

        assertNotNull(response);
        verify(postRepo).save(existing);
    }

    @Test
    void update_shouldThrowIfPostNotFound() {
        when(postRepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.update(1, makeDto()));
    }

    // ------------------------------------------------------------
    // FIND BY ID
    // ------------------------------------------------------------
    @Test
    void findById_shouldReturnDto() {
        TeamPost post = new TeamPost();
        post.setPostId(1);

        when(postRepo.findById(1)).thenReturn(Optional.of(post));

        var result = service.findById(1);

        assertNotNull(result);
    }

    @Test
    void findById_shouldThrowIfMissing() {
        when(postRepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.findById(1));
    }

    // ------------------------------------------------------------
    // FIND ALL BY TEAM
    // ------------------------------------------------------------
    @Test
    void findAllByTeamId_shouldReturnPagedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Team team = makeTeam();

        when(teamRepo.findById(100)).thenReturn(Optional.of(team));
        when(postRepo.findAllByTeam(eq(team), any()))
                .thenReturn(new PageImpl<>(List.of(new TeamPost())));

        var result = service.findAllByTeamId(pageable, "createdAt", "ASC", 100);

        assertEquals(1, result.getContent().size());
    }

    @Test
    void findAllByTeamId_shouldThrowIfTeamNotFound() {
        when(teamRepo.findById(100)).thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 10);

        assertThrows(IllegalArgumentException.class,
                () -> service.findAllByTeamId(pageable, "createdAt", "ASC", 100));
    }

    // ------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------
    @Test
    void delete_shouldRemovePost() {
        TeamPost post = new TeamPost();
        post.setPostId(1);

        when(postRepo.findById(1)).thenReturn(Optional.of(post));

        service.delete(1);

        verify(postRepo).delete(post);
    }

    @Test
    void delete_shouldThrowIfMissing() {
        when(postRepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.delete(1));
    }

    // ------------------------------------------------------------
    // RESTORE
    // ------------------------------------------------------------
    @Test
    void restore_shouldResetDeletionFlags() {
        TeamPost post = new TeamPost();
        post.setPostId(1);
        post.setIsDeleted(true);

        when(postRepo.findById(1)).thenReturn(Optional.of(post));

        service.restore(1);

        assertFalse(post.getIsDeleted());
        assertNull(post.getDeletedAt());
        verify(postRepo).save(post);
    }

    @Test
    void restore_shouldThrowIfMissing() {
        when(postRepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.restore(1));
    }
}
