package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.TeamPostComment.TeamPostCommentResponseDto;
import com.joinmatch.backend.model.TeamPost;
import com.joinmatch.backend.model.TeamPostComment;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.TeamPostCommentRepository;
import com.joinmatch.backend.repository.TeamPostRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.NotificationService;
import com.joinmatch.backend.service.TeamPostCommentService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamPostCommentServiceTest {

    @Mock
    private TeamPostCommentRepository commentRepository;

    @Mock
    private TeamPostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeamPostCommentService service;

    private TeamPostCommentResponseDto makeDto(
            Integer commentId,
            Integer postId,
            Integer authorId,
            String content,
            Integer parentCommentId
    ) {
        return new TeamPostCommentResponseDto(
                commentId,
                postId,
                authorId,
                "AuthorName",
                "avatar.png",
                parentCommentId,
                content,
                null,
                null,
                false,
                null,
                List.of(),
                Map.of()
        );
    }


    // -------------------------------------------------------
    // createComment – zwykły komentarz (bez parenta)
    // -------------------------------------------------------
    @Test
    void createComment_shouldCreateRootCommentAndSendPostNotification() {
        TeamPostCommentResponseDto dto = makeDto(
                null,
                10,
                1,
                "Siema",
                null
        );

        TeamPost post = new TeamPost();
        post.setPostId(10);

        User author = new User();
        author.setId(1);

        TeamPostComment saved = new TeamPostComment();
        saved.setCommentId(100);
        saved.setPost(post);
        saved.setAuthor(author);
        saved.setContent("Siema");
        saved.setIsDeleted(false);

        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(userRepository.findById(1)).thenReturn(Optional.of(author));
        when(commentRepository.save(any(TeamPostComment.class))).thenReturn(saved);

        TeamPostCommentResponseDto out = service.createComment(dto);

        assertEquals(100, out.commentId());
        verify(notificationService).sendCommentNotifications(any(TeamPostComment.class));
        verify(notificationService, never()).sendCommentReplyNotification(any());
    }

    // -------------------------------------------------------
    // createComment – odpowiedź na komentarz (ma parentCommentId)
    // -------------------------------------------------------
    @Test
    void createComment_shouldCreateReplyAndSendReplyNotification() {
        TeamPostCommentResponseDto dto = makeDto(
                null,
                10,
                1,
                "Odpowiedź",
                50
        );

        TeamPost post = new TeamPost();
        post.setPostId(10);

        User author = new User();
        author.setId(1);

        TeamPostComment parent = new TeamPostComment();
        parent.setCommentId(50);

        TeamPostComment saved = new TeamPostComment();
        saved.setCommentId(101);
        saved.setPost(post);
        saved.setAuthor(author);
        saved.setContent("Odpowiedź");
        saved.setParentComment(parent);

        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(userRepository.findById(1)).thenReturn(Optional.of(author));
        when(commentRepository.findById(50)).thenReturn(Optional.of(parent));
        when(commentRepository.save(any(TeamPostComment.class))).thenReturn(saved);

        TeamPostCommentResponseDto out = service.createComment(dto);

        assertEquals(101, out.commentId());
        verify(notificationService).sendCommentReplyNotification(any(TeamPostComment.class));
        verify(notificationService, never()).sendCommentNotifications(any());
    }

    @Test
    void createComment_shouldThrowIfPostNotFound() {
        TeamPostCommentResponseDto dto = makeDto(null, 10, 1, "X", null);

        when(postRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.createComment(dto));
    }

    @Test
    void createComment_shouldThrowIfAuthorNotFound() {
        TeamPostCommentResponseDto dto = makeDto(null, 10, 1, "X", null);

        TeamPost post = new TeamPost();
        post.setPostId(10);

        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.createComment(dto));
    }

    @Test
    void createComment_shouldThrowIfParentNotFound() {
        TeamPostCommentResponseDto dto = makeDto(null, 10, 1, "X", 999);

        TeamPost post = new TeamPost();
        post.setPostId(10);

        User author = new User();
        author.setId(1);

        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(userRepository.findById(1)).thenReturn(Optional.of(author));
        when(commentRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.createComment(dto));
    }

    // -------------------------------------------------------
    // findAllByPostId
    // -------------------------------------------------------
    @Test
    void findAllByPostId_shouldReturnPagedComments() {
        Pageable pageable = PageRequest.of(0, 10);
        TeamPost post = new TeamPost();
        post.setPostId(10);

        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(1);
        comment.setPost(post);

        Page<TeamPostComment> page = new PageImpl<>(List.of(comment));

        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(commentRepository.findAllByPost(eq(post), any(Pageable.class)))
                .thenReturn(page);

        Page<TeamPostCommentResponseDto> result =
                service.findAllByPostId(pageable, "createdAt", "DESC", 10);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void findAllByPostId_shouldThrowIfPostNotFound() {
        Pageable pageable = PageRequest.of(0, 10);
        when(postRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.findAllByPostId(pageable, "createdAt", "DESC", 10));
    }

    // -------------------------------------------------------
    // restore
    // -------------------------------------------------------
    @Test
    void restore_shouldUnsetDeletedFlagsAndSave() {
        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(5);
        comment.setIsDeleted(true);
        comment.setDeletedAt(LocalDateTime.now());

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));

        service.restore(5);

        assertFalse(comment.getIsDeleted());
        assertNull(comment.getDeletedAt());
        verify(commentRepository).save(comment);
    }

    @Test
    void restore_shouldThrowIfCommentNotFound() {
        when(commentRepository.findById(5)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.restore(5));
    }

    // -------------------------------------------------------
    // update
    // -------------------------------------------------------
    @Test
    void update_shouldModifyExistingComment() {
        TeamPostCommentResponseDto dto = makeDto(
                7,
                10,
                1,
                "Zmieniona treść",
                null
        );

        TeamPost post = new TeamPost();
        post.setPostId(10);

        User author = new User();
        author.setId(1);

        TeamPostComment existing = new TeamPostComment();
        existing.setCommentId(7);
        existing.setPost(post);
        existing.setAuthor(author);
        existing.setContent("Stara treść");

        when(commentRepository.findById(7)).thenReturn(Optional.of(existing));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(userRepository.findById(1)).thenReturn(Optional.of(author));
        when(commentRepository.save(existing)).thenReturn(existing);

        TeamPostCommentResponseDto out = service.update(dto);

        assertEquals(7, out.commentId());
        verify(commentRepository).save(existing);
    }

    @Test
    void update_shouldThrowIfCommentNotFound() {
        TeamPostCommentResponseDto dto = makeDto(7, 10, 1, "X", null);
        when(commentRepository.findById(7)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.update(dto));
    }

    // -------------------------------------------------------
    // delete
    // -------------------------------------------------------
    @Test
    void delete_shouldRemoveComment() {
        TeamPostComment comment = new TeamPostComment();
        comment.setCommentId(9);

        when(commentRepository.findById(9)).thenReturn(Optional.of(comment));

        service.delete(9);

        verify(commentRepository).delete(comment);
    }

    @Test
    void delete_shouldThrowIfCommentNotFound() {
        when(commentRepository.findById(9)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.delete(9));
    }
}
