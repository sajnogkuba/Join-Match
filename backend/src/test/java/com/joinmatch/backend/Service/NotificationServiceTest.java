package com.joinmatch.backend.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joinmatch.backend.dto.Notification.*;
import com.joinmatch.backend.enums.NotificationType;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.NotificationRepository;
import com.joinmatch.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    // ------------------------------------------------------------
    // FRIEND REQUEST NOTIFICATIONS
    // ------------------------------------------------------------

    @Test
    void sendFriendRequestNotification_shouldSaveAndSendWebsocket() throws Exception {
        User sender = new User();
        sender.setId(10);
        sender.setName("Kuba");

        User receiver = new User();
        receiver.setId(20);

        when(objectMapper.writeValueAsString(any())).thenReturn("{json}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendFriendRequestNotification(receiver, sender, 55);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("20"), eq("/queue/notifications"), any());
    }

    @Test
    void sendFriendRequestAcceptedNotification_shouldSaveAndSend() throws Exception {
        User sender = new User(); sender.setId(1); sender.setName("Adam");
        User receiver = new User(); receiver.setId(2);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendFriendRequestAcceptedNotification(receiver, sender);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("2"), eq("/queue/notifications"), any());
    }

    @Test
    void sendFriendRequestRejectedNotification_shouldSaveAndSend() throws Exception {
        User sender = new User(); sender.setId(5); sender.setName("Jan");
        User receiver = new User(); receiver.setId(7);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendFriendRequestRejectedNotification(receiver, sender);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("7"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // USER NOTIFICATIONS (LIST / COUNT / READ)
    // ------------------------------------------------------------

    @Test
    void getUserNotifications_shouldReturnDtos() {
        Notification n = Notification.builder().id(1).title("Test").build();
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(10))
                .thenReturn(List.of(n));

        var result = notificationService.getUserNotifications(10);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).id());
    }

    @Test
    void getUnreadCount_shouldReturnValue() {
        when(notificationRepository.countByUserIdAndIsReadFalse(5))
                .thenReturn(3L);

        assertEquals(3, notificationService.getUnreadCount(5));
    }

    @Test
    void markAsRead_shouldUpdateNotification() {
        Notification n = Notification.builder().id(10).isRead(false).build();
        when(notificationRepository.findById(10)).thenReturn(Optional.of(n));

        notificationService.markAsRead(10);

        assertTrue(n.getIsRead());
        verify(notificationRepository).save(n);
    }

    // ------------------------------------------------------------
    // TEAM REQUEST ACCEPTED
    // ------------------------------------------------------------

    @Test
    void sendTeamRequestAcceptedNotification_shouldSaveAndSend() throws Exception {
        User leader = new User(); leader.setId(100); leader.setName("Leader");
        User receiver = new User(); receiver.setName("Ola");

        Team team = new Team();
        team.setId(50);
        team.setLeader(leader);

        TeamRequest req = new TeamRequest();
        req.setRequestId(7);
        req.setTeam(team);
        req.setReceiver(receiver);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendTeamRequestAcceptedNotification(req);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("100"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // TEAM LEFT
    // ------------------------------------------------------------

    @Test
    void sendTeamLeftNotification_shouldSaveAndSend() throws Exception {
        User leader = new User(); leader.setId(20); leader.setName("Boss");
        User member = new User(); member.setId(99); member.setName("Joe");

        Team team = new Team();
        team.setLeader(leader);
        team.setId(5);

        UserTeam userTeam = new UserTeam();
        userTeam.setTeam(team);
        userTeam.setUser(member);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendTeamLeftNotification(userTeam);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("20"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // TEAM MEMBER REMOVED
    // ------------------------------------------------------------

    @Test
    void sendTeamMemberRemovedNotification_shouldSaveAndSend() throws Exception {
        User leader = new User(); leader.setId(11); leader.setName("Chief");
        User removed = new User(); removed.setId(33); removed.setName("Patryk");

        Team team = new Team();
        team.setLeader(leader);
        team.setId(40);

        UserTeam ut = new UserTeam();
        ut.setUser(removed);
        ut.setTeam(team);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendTeamMemberRemovedNotification(ut, "Powód testowy");

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("33"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // TEAM REQUEST
    // ------------------------------------------------------------

    @Test
    void sendTeamRequestNotification_shouldSaveAndSend() throws Exception {
        User leader = new User(); leader.setId(42); leader.setName("Boss");
        User receiver = new User(); receiver.setId(66);

        Team team = new Team(); team.setLeader(leader); team.setId(8);

        TeamRequest req = new TeamRequest();
        req.setTeam(team);
        req.setReceiver(receiver);
        req.setRequestId(123);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendTeamRequestNotification(req);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("66"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // TEAM REQUEST REJECTED
    // ------------------------------------------------------------

    @Test
    void sendTeamRejectAcceptedNotification_shouldSaveAndSend() throws Exception {
        User leader = new User(); leader.setId(50); leader.setName("Boss");
        User receiver = new User(); receiver.setName("Guest");

        Team team = new Team(); team.setLeader(leader); team.setId(12);

        TeamRequest req = new TeamRequest();
        req.setTeam(team);
        req.setReceiver(receiver);
        req.setRequestId(999);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendTeamRejectAcceptedNotification(req);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("50"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // TEAM CANCELLATION
    // ------------------------------------------------------------

    @Test
    void notifyTeamCancellation_shouldNotifyAllMembersExceptLeader() throws Exception {
        User leader = new User(); leader.setId(1); leader.setName("Boss");
        User m1 = new User(); m1.setId(2);
        User m2 = new User(); m2.setId(3);

        Team team = new Team();
        team.setLeader(leader);
        team.setId(99);

        UserTeam ut1 = new UserTeam(); ut1.setTeam(team); ut1.setUser(m1);
        UserTeam ut2 = new UserTeam(); ut2.setTeam(team); ut2.setUser(m2);

        team.setUserTeams(List.of(ut1, ut2));

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.notifyTeamCancellation(team, "Powód");

        verify(messagingTemplate)
                .convertAndSendToUser(eq("2"), eq("/queue/notifications"), any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("3"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // POST COMMENT NOTIFICATION
    // ------------------------------------------------------------

    @Test
    void sendCommentNotifications_shouldSaveAndSend() throws Exception {
        User author = new User(); author.setId(10);
        User commenter = new User(); commenter.setId(20); commenter.setName("Kuba");

        TeamPost post = new TeamPost();
        post.setAuthor(author);
        post.setPostId(7);

        TeamPostComment comment = new TeamPostComment();
        comment.setPost(post);
        comment.setAuthor(commenter);
        comment.setCommentId(55);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendCommentNotifications(comment);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("10"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // POST REACTION
    // ------------------------------------------------------------

    @Test
    void sendPostReactionNotification_shouldSaveAndSend() throws Exception {
        User author = new User(); author.setId(10);
        User reactor = new User(); reactor.setId(20); reactor.setName("Maciek");

        TeamPost post = new TeamPost();
        post.setAuthor(author);
        post.setPostId(99);

        ReactionType rt = new ReactionType();
        rt.setId(5);

        TeamPostReaction reaction = new TeamPostReaction();
        reaction.setPost(post);
        reaction.setUser(reactor);
        reaction.setReactionType(rt);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendPostReactionNotification(reaction);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("10"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // COMMENT REACTION
    // ------------------------------------------------------------

    @Test
    void sendCommentReactionNotification_shouldSaveAndSend() throws Exception {
        User author = new User(); author.setId(50);
        User reactor = new User(); reactor.setId(60); reactor.setName("Piotr");

        TeamPost post = new TeamPost(); post.setPostId(77); post.setAuthor(author);

        TeamPostComment comment = new TeamPostComment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setCommentId(33);

        TeamPostCommentReaction reaction = new TeamPostCommentReaction();
        reaction.setComment(comment);
        reaction.setUser(reactor);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendCommentReactionNotification(reaction);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("50"), eq("/queue/notifications"), any());
    }

    // ------------------------------------------------------------
    // COMMENT REPLY NOTIFICATION
    // ------------------------------------------------------------

    @Test
    void sendCommentReplyNotification_shouldSendToParentAuthor() throws Exception {
        User parentAuthor = new User(); parentAuthor.setId(100);
        User replier = new User(); replier.setId(200); replier.setName("Kacper");

        TeamPost post = new TeamPost();
        post.setPostId(66);

        TeamPostComment parent = new TeamPostComment();
        parent.setCommentId(1);
        parent.setAuthor(parentAuthor);
        parent.setPost(post);

        TeamPostComment reply = new TeamPostComment();
        reply.setCommentId(2);
        reply.setAuthor(replier);
        reply.setPost(post);
        reply.setParentComment(parent);

        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendCommentReplyNotification(reply);

        verify(notificationRepository).save(any());
        verify(messagingTemplate)
                .convertAndSendToUser(eq("100"), eq("/queue/notifications"), any());
    }

    @Test
    void sendCommentReplyNotification_shouldDoNothingIfNotReply() {
        TeamPostComment comment = new TeamPostComment(); // parentComment = null

        notificationService.sendCommentReplyNotification(comment);

        // no calls
        verify(notificationRepository, never()).save(any());
        verify(messagingTemplate, never())
                .convertAndSendToUser(any(), any(), any());
    }
}
