package com.joinmatch.backend.Service;
import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.dto.Message.ConversationDto;
import com.joinmatch.backend.dto.Message.ConversationPreviewDto;
import com.joinmatch.backend.enums.ConversationType;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private MessageRepository messageRepository;
    @Mock private ConversationRepository conversationRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventRepository eventRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private MessageReadRepository messageReadRepository;

    @InjectMocks
    private ChatService chatService;

    // ============================================================
    // 1) saveMessage()
    // ============================================================

    @Test
    void saveMessage_shouldSaveMessageCorrectly() {
        // given
        Conversation conv = new Conversation();
        conv.setId(10);
        conv.setType(ConversationType.PRIVATE);

        User sender = new User();
        sender.setId(5);
        sender.setName("Kuba");
        sender.setUrlOfPicture("avatar.png");

        ChatMessageDto dto = new ChatMessageDto(
                null,
                10,
                5,
                null,
                null,
                "Hello!",
                null,
                null,
                null,
                null
        );

        when(conversationRepository.findById(10))
                .thenReturn(Optional.of(conv));

        when(userRepository.findById(5))
                .thenReturn(Optional.of(sender));

        Message saved = Message.builder()
                .id(99)
                .conversation(conv)
                .sender(sender)
                .content("Hello!")
                .createdAt(LocalDateTime.now())
                .build();

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation -> {
                    Message m = invocation.getArgument(0);
                    m.setId(99);
                    return m;
                });


        // when
        ChatMessageDto out = chatService.saveMessage(dto);

        // then
        assertEquals(99, out.messageId());
        assertEquals(10, out.conversationId());
        assertEquals(5, out.senderId());
        assertEquals("Kuba", out.senderName());
        assertEquals("Hello!", out.content());

        verify(messageRepository).save(any());
    }

    // ============================================================
    // 2) getMessagesByConversation()
    // ============================================================

    @Test
    void getMessagesByConversation_shouldMapMessagesCorrectly() {
        Conversation conv = new Conversation();
        conv.setId(77);
        conv.setType(ConversationType.PRIVATE);

        User sender = new User();
        sender.setId(8);
        sender.setName("Mati");

        Message m1 = Message.builder()
                .id(1)
                .conversation(conv)
                .sender(sender)
                .content("msg1")
                .createdAt(LocalDateTime.now())
                .build();

        Message m2 = Message.builder()
                .id(2)
                .conversation(conv)
                .sender(sender)
                .content("msg2")
                .createdAt(LocalDateTime.now())
                .build();

        when(messageRepository.findByConversationIdOrderByCreatedAtAsc(77))
                .thenReturn(List.of(m1, m2));

        List<ChatMessageDto> out = chatService.getMessagesByConversation(77);

        assertEquals(2, out.size());
        assertEquals("msg1", out.get(0).content());
        assertEquals("msg2", out.get(1).content());
    }

    // ============================================================
    // 3) createDirectConversation()
    // ============================================================

    @Test
    void createDirectConversation_shouldReturnExistingIfPresent() {
        Conversation existing = new Conversation();
        existing.setId(55);

        when(userRepository.findById(1)).thenReturn(Optional.of(new User()));
        when(userRepository.findById(2)).thenReturn(Optional.of(new User()));
        when(conversationRepository.findDirectBetweenUsers(1, 2))
                .thenReturn(Optional.of(existing));

        Conversation out = chatService.createDirectConversation(1, 2);

        assertEquals(55, out.getId());
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void createDirectConversation_shouldCreateNewIfNotPresent() {
        User u1 = new User();
        u1.setId(1);
        User u2 = new User();
        u2.setId(2);

        when(userRepository.findById(1)).thenReturn(Optional.of(u1));
        when(userRepository.findById(2)).thenReturn(Optional.of(u2));
        when(conversationRepository.findDirectBetweenUsers(1, 2))
                .thenReturn(Optional.empty());

        Conversation saved = new Conversation();
        saved.setId(88);

        when(conversationRepository.save(any())).thenReturn(saved);

        Conversation out = chatService.createDirectConversation(1, 2);

        assertEquals(88, out.getId());
        verify(conversationRepository).save(any());
    }
    // ============================================================
    // 4) createDirectConversationDto()
    // ============================================================

    @Test
    void createDirectConversationDto_shouldReturnDtoCorrectly() {
        User u1 = new User();
        u1.setId(1);
        u1.setName("A");

        User u2 = new User();
        u2.setId(2);
        u2.setName("B");

        Conversation conv = new Conversation();
        conv.setId(123);
        conv.setType(ConversationType.PRIVATE);
        conv.setParticipants(List.of(u1, u2));

        when(userRepository.findById(1)).thenReturn(Optional.of(u1));
        when(userRepository.findById(2)).thenReturn(Optional.of(u2));
        when(conversationRepository.findDirectBetweenUsers(1, 2))
                .thenReturn(Optional.of(conv));

        ConversationDto dto = chatService.createDirectConversationDto(1, 2);

        assertEquals(123, dto.id());
        assertEquals("PRIVATE", dto.type());
        assertEquals(2, dto.participants().size());
    }

    // ============================================================
    // 5) getUserConversations()
    // ============================================================

    @Test
    void getUserConversations_shouldReturnList() {
        Conversation c1 = new Conversation();
        c1.setId(10);

        Conversation c2 = new Conversation();
        c2.setId(20);

        when(conversationRepository.findByParticipantId(99))
                .thenReturn(List.of(c1, c2));

        List<Conversation> out = chatService.getUserConversations(99);

        assertEquals(2, out.size());
        assertEquals(10, out.get(0).getId());
        assertEquals(20, out.get(1).getId());
    }

    // ============================================================
    // 6) getUserConversationPreviews()
    // ============================================================

    @Test
    void getUserConversationPreviews_shouldReturnPreviewForPrivateChat() {

        // ========== USERS ==========
        User owner = new User();
        owner.setId(10);
        owner.setName("Owner");

        User other = new User();
        other.setId(20);
        other.setName("Marek");
        other.setUrlOfPicture("photo.png");

        // ========== CONVERSATION ==========
        Conversation c = new Conversation();
        c.setId(111);
        c.setType(ConversationType.PRIVATE);
        c.setParticipants(List.of(owner, other));

        when(conversationRepository.findByParticipantId(10))
                .thenReturn(List.of(c));

        // ========== LAST MESSAGE ==========
        Message lastMsg = Message.builder()
                .id(55)
                .conversation(c)
                .sender(other)
                .content("Siema!")
                .createdAt(LocalDateTime.now())
                .build();

        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc(111))
                .thenReturn(Optional.of(lastMsg));

        when(messageRepository.countUnreadMessages(111, 10))
                .thenReturn(3L);

        // ========== RUN ==========
        List<ConversationPreviewDto> out = chatService.getUserConversationPreviews(10);

        assertEquals(1, out.size());
        ConversationPreviewDto preview = out.get(0);

        assertEquals(111, preview.id());
        assertEquals("Marek", preview.name());
        assertEquals("photo.png", preview.avatarUrl());
        assertEquals("Marek: Siema!", preview.lastMessage());
        assertEquals(3, preview.unreadCount());
    }

    @Test
    void getUserConversationPreviews_shouldReturnPreviewForTeamChat() {

        // ========== TEAM ==========
        Team t = new Team();
        t.setId(77);
        t.setName("Dzikie Koty");
        t.setPhotoUrl("team.png");

        // ========== CONVERSATION ==========
        Conversation c = new Conversation();
        c.setId(222);
        c.setType(ConversationType.TEAM);
        c.setTeam(t);

        when(conversationRepository.findByParticipantId(5))
                .thenReturn(List.of(c));

        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc(222))
                .thenReturn(Optional.empty());

        when(messageRepository.countUnreadMessages(222, 5))
                .thenReturn(0L);

        List<ConversationPreviewDto> out = chatService.getUserConversationPreviews(5);

        assertEquals(1, out.size());
        ConversationPreviewDto preview = out.get(0);

        assertEquals(222, preview.id());
        assertEquals("Dzikie Koty", preview.name());
        assertEquals("team.png", preview.avatarUrl());
        assertEquals("Brak wiadomości", preview.lastMessage());
        assertEquals(0, preview.unreadCount());
    }

    @Test
    void getUserConversationPreviews_shouldReturnPreviewForEventChat() {

        // ========== EVENT ==========
        Event event = new Event();
        event.setEventId(33);
        event.setEventName("Turniej Siatkówki");
        event.setImageUrl("event.png");

        // ========== CONVERSATION ==========
        Conversation c = new Conversation();
        c.setId(333);
        c.setType(ConversationType.EVENT);
        c.setEvent(event);

        when(conversationRepository.findByParticipantId(8))
                .thenReturn(List.of(c));

        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc(333))
                .thenReturn(Optional.empty());

        when(messageRepository.countUnreadMessages(333, 8))
                .thenReturn(10L);

        List<ConversationPreviewDto> out = chatService.getUserConversationPreviews(8);

        assertEquals(1, out.size());
        ConversationPreviewDto preview = out.get(0);

        assertEquals(333, preview.id());
        assertEquals("Turniej Siatkówki", preview.name());
        assertEquals("event.png", preview.avatarUrl());
        assertEquals("Brak wiadomości", preview.lastMessage());
        assertEquals(10, preview.unreadCount());
    }

    // ============================================================
    // 7) createTeamConversation()
    // ============================================================

    @Test
    void createTeamConversation_shouldReturnExistingIfPresent() {
        Team team = new Team();
        team.setId(50);
        team.setName("Orły");

        Conversation existing = new Conversation();
        existing.setId(500);
        existing.setType(ConversationType.TEAM);
        existing.setTeam(team);
        existing.setParticipants(new ArrayList<>()); // ✅ TU

        when(teamRepository.findById(50))
                .thenReturn(Optional.of(team));

        when(conversationRepository.findByTeamId(50))
                .thenReturn(Optional.of(existing));

        ConversationDto out = chatService.createTeamConversation(50);

        assertEquals(500, out.id());
        assertEquals("TEAM", out.type());
        assertEquals(50, out.teamId());
    }

    @Test
    void createTeamConversation_shouldCreateNewIfNotExists() {

        // TEAM
        Team team = new Team();
        team.setId(10);

        User u1 = new User();
        u1.setId(1);
        User u2 = new User();
        u2.setId(2);

        UserTeam ut1 = UserTeam.builder().user(u1).build();
        UserTeam ut2 = UserTeam.builder().user(u2).build();
        team.setUserTeams(List.of(ut1, ut2));

        // New conversation to save
        Conversation saved = new Conversation();
        saved.setId(123);
        saved.setType(ConversationType.TEAM);
        saved.setParticipants(List.of(u1, u2));
        saved.setTeam(team);

        when(teamRepository.findById(10))
                .thenReturn(Optional.of(team));

        when(conversationRepository.findByTeamId(10))
                .thenReturn(Optional.empty());

        when(conversationRepository.save(any()))
                .thenAnswer(inv -> {
                    Conversation c = inv.getArgument(0);
                    c.setId(123);
                    return c;
                });

        ConversationDto out = chatService.createTeamConversation(10);

        assertEquals(123, out.id());
        assertEquals("TEAM", out.type());
        assertEquals(10, out.teamId());
        assertEquals(2, out.participants().size());
    }

    // ============================================================
    // 8) createEventConversation()
    // ============================================================

    @Test
    void createEventConversation_shouldReturnExistingIfPresent() {
        Event event = new Event();
        event.setEventId(70);
        event.setEventName("Wielki Finał");

        Conversation existing = new Conversation();
        existing.setId(701);
        existing.setType(ConversationType.EVENT);
        existing.setEvent(event);
        existing.setParticipants(new ArrayList<>()); // ✅ TU

        when(eventRepository.findById(70)).thenReturn(Optional.of(event));
        when(conversationRepository.findByEventEventId(70))
                .thenReturn(Optional.of(existing));

        ConversationDto out = chatService.createEventConversation(70);

        assertEquals(701, out.id());
        assertEquals("EVENT", out.type());
        assertEquals(70, out.eventId());
    }


    @Test
    void createEventConversation_shouldCreateNewIfNotExists() {
        Event event = new Event();
        event.setEventId(33);

        User u1 = new User();
        u1.setId(1);

        User u2 = new User();
        u2.setId(2);

        UserEvent ue1 = new UserEvent(1, u1, event, null);
        UserEvent ue2 = new UserEvent(2, u2, event, null);

        event.setUserEvents(List.of(ue1, ue2));

        when(eventRepository.findById(33))
                .thenReturn(Optional.of(event));

        when(conversationRepository.findByEventEventId(33))
                .thenReturn(Optional.empty());

        when(conversationRepository.save(any()))
                .thenAnswer(inv -> {
                    Conversation c = inv.getArgument(0);
                    c.setId(999);
                    return c;
                });

        ConversationDto out = chatService.createEventConversation(33);

        assertEquals(999, out.id());
        assertEquals("EVENT", out.type());
        assertEquals(33, out.eventId());
        assertEquals(2, out.participants().size());
    }

    // ============================================================
    // 9) addUserToEventChat()
    // ============================================================

    @Test
    void addUserToEventChat_shouldAddUserIfNotPresent() {

        // Conversation
        Conversation conv = new Conversation();
        conv.setId(200);
        conv.setType(ConversationType.EVENT);
        conv.setParticipants(new java.util.ArrayList<>());

        when(conversationRepository.findByEventEventId(44))
                .thenReturn(Optional.of(conv));

        // User
        User user = new User();
        user.setId(77);

        when(userRepository.findById(77)).thenReturn(Optional.of(user));

        chatService.addUserToEventChat(44, 77);

        assertEquals(1, conv.getParticipants().size());
        assertEquals(77, conv.getParticipants().get(0).getId());
        verify(conversationRepository).save(conv);
    }

    @Test
    void addUserToEventChat_shouldDoNothingIfAlreadyPresent() {

        User user = new User();
        user.setId(77);

        Conversation conv = new Conversation();
        conv.setParticipants(new java.util.ArrayList<>(List.of(user)));

        when(conversationRepository.findByEventEventId(44))
                .thenReturn(Optional.of(conv));

        when(userRepository.findById(77))
                .thenReturn(Optional.of(user));

        chatService.addUserToEventChat(44, 77);

        assertEquals(1, conv.getParticipants().size());
        verify(conversationRepository, never()).save(any());
    }

    // ============================================================
    // 10) removeUserFromEventChat()
    // ============================================================

    @Test
    void removeUserFromEventChat_shouldRemoveUserAndSave() {

        User u1 = new User();
        u1.setId(1);

        User u2 = new User();
        u2.setId(2);

        Conversation conv = new Conversation();
        conv.setParticipants(new java.util.ArrayList<>(List.of(u1, u2)));

        when(conversationRepository.findByEventEventId(99))
                .thenReturn(Optional.of(conv));

        chatService.removeUserFromEventChat(99, 2);

        assertEquals(1, conv.getParticipants().size());
        assertEquals(1, conv.getParticipants().get(0).getId());
        verify(conversationRepository).save(conv);
    }

    // ============================================================
    // 11) addUserToTeamChat()
    // ============================================================

    @Test
    void addUserToTeamChat_shouldAddUserIfNotPresent() {
        User user = new User();
        user.setId(10);

        Conversation conv = new Conversation();
        conv.setParticipants(new ArrayList<>());

        when(conversationRepository.findByTeamId(5))
                .thenReturn(Optional.of(conv));
        when(userRepository.findById(10))
                .thenReturn(Optional.of(user));

        chatService.addUserToTeamChat(5, 10);

        assertEquals(1, conv.getParticipants().size());
        assertEquals(10, conv.getParticipants().get(0).getId());
        verify(conversationRepository).save(conv);
    }

    @Test
    void addUserToTeamChat_shouldNotSaveWhenAlreadyParticipant() {
        User user = new User();
        user.setId(10);

        Conversation conv = new Conversation();
        conv.setParticipants(new ArrayList<>(List.of(user)));

        when(conversationRepository.findByTeamId(5))
                .thenReturn(Optional.of(conv));
        when(userRepository.findById(10))
                .thenReturn(Optional.of(user));

        chatService.addUserToTeamChat(5, 10);

        assertEquals(1, conv.getParticipants().size());
        verify(conversationRepository, never()).save(any());
    }

    // ============================================================
    // 12) removeUserFromTeamChat()
    // ============================================================

    @Test
    void removeUserFromTeamChat_shouldRemoveUserAndSave() {
        User u1 = new User();
        u1.setId(1);
        User u2 = new User();
        u2.setId(2);

        Conversation conv = new Conversation();
        conv.setParticipants(new ArrayList<>(List.of(u1, u2)));

        when(conversationRepository.findByTeamId(9))
                .thenReturn(Optional.of(conv));

        chatService.removeUserFromTeamChat(9, 2);

        assertEquals(1, conv.getParticipants().size());
        assertEquals(1, conv.getParticipants().get(0).getId());
        verify(conversationRepository).save(conv);
    }

    // ============================================================
    // 13) markMessagesAsRead()
    // ============================================================

    @Test
    void markMessagesAsRead_shouldSaveReadForUnreadMessages() {
        Message m1 = Message.builder().id(1).build();
        Message m2 = Message.builder().id(2).build();

        when(messageRepository.findUnreadMessages(100, 7, 50))
                .thenReturn(List.of(m1, m2));

        User user = new User();
        user.setId(7);
        when(userRepository.findById(7)).thenReturn(Optional.of(user));

        when(messageReadRepository.existsByMessageIdAndUserId(1, 7))
                .thenReturn(false);
        when(messageReadRepository.existsByMessageIdAndUserId(2, 7))
                .thenReturn(true); // drugi już przeczytany

        chatService.markMessagesAsRead(100, 7, 50);

        // tylko dla pierwszej wiadomości powinno być save
        verify(messageReadRepository, times(1)).save(any(MessageRead.class));
    }

    // ============================================================
    // 14) countTotalUnread()
    // ============================================================

    @Test
    void countTotalUnread_shouldSumUnreadFromAllConversations() {
        Conversation c1 = new Conversation();
        c1.setId(1);
        Conversation c2 = new Conversation();
        c2.setId(2);

        when(conversationRepository.findByParticipantId(10))
                .thenReturn(List.of(c1, c2));

        when(messageRepository.countUnreadMessages(1, 10))
                .thenReturn(3L);
        when(messageRepository.countUnreadMessages(2, 10))
                .thenReturn(5L);

        long total = chatService.countTotalUnread(10);

        assertEquals(8L, total);
    }
}

