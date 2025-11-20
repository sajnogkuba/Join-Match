package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.dto.Message.ConversationDto;
import com.joinmatch.backend.dto.Message.ConversationPreviewDto;
import com.joinmatch.backend.dto.Message.ParticipantDto;
import com.joinmatch.backend.enums.ConversationType;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final MessageReadRepository messageReadRepository;

    private ConversationDto mapToConversationDto(Conversation conversation) {
        List<ParticipantDto> participants = conversation.getParticipants().stream()
                .map(u -> new ParticipantDto(u.getId(), u.getName(), u.getUrlOfPicture()))
                .toList();

        Integer teamId = conversation.getTeam() != null ? conversation.getTeam().getId() : null;
        String teamName = conversation.getTeam() != null ? conversation.getTeam().getName() : null;
        Integer eventId = conversation.getEvent() != null ? conversation.getEvent().getEventId() : null;
        String eventName = conversation.getEvent() != null ? conversation.getEvent().getEventName() : null;

        return new ConversationDto(
                conversation.getId(),
                conversation.getType().name(),
                participants,
                teamId,
                teamName,
                eventId,
                eventName
        );
    }


    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        Conversation conversation = conversationRepository.findById(dto.conversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = userRepository.findById(dto.senderId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(dto.content())
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(message);

        return new ChatMessageDto(
                message.getId(),
                conversation.getId(),
                sender.getId(),
                sender.getName(),
                sender.getUrlOfPicture(),
                saved.getContent(),
                saved.getCreatedAt(),
                conversation.getType().name(),
                conversation.getTeam() != null ? conversation.getTeam().getId() : null,
                conversation.getEvent() != null ? conversation.getEvent().getEventId() : null
        );
    }

    public List<ChatMessageDto> getMessagesByConversation(Integer conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(m -> new ChatMessageDto(
                        m.getId(),
                        m.getConversation().getId(),
                        m.getSender().getId(),
                        m.getSender().getName(),
                        m.getSender().getUrlOfPicture(),
                        m.getContent(),
                        m.getCreatedAt(),
                        m.getConversation().getType().name(),
                        m.getConversation().getTeam() != null ? m.getConversation().getTeam().getId() : null,
                        m.getConversation().getEvent() != null ? m.getConversation().getEvent().getEventId() : null
                ))
                .toList();
    }

    @Transactional
    public Conversation createDirectConversation(Integer user1Id, Integer user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        Optional<Conversation> existing = conversationRepository
                .findDirectBetweenUsers(user1Id, user2Id);
        if (existing.isPresent()) {
            return existing.get();
        }

        Conversation conversation = Conversation.builder()
                .type(ConversationType.PRIVATE)
                .participants(List.of(user1, user2))
                .build();

        return conversationRepository.save(conversation);
    }
    @Transactional
    public ConversationDto createDirectConversationDto(Integer user1Id, Integer user2Id) {
        Conversation conversation = createDirectConversation(user1Id, user2Id);

        List<ParticipantDto> participants = conversation.getParticipants().stream()
                .map(u -> new ParticipantDto(u.getId(), u.getName(), u.getUrlOfPicture()))
                .toList();

        return new ConversationDto(conversation.getId(), conversation.getType().name(), participants, null, null, null, null);
    }
    public List<Conversation> getUserConversations(Integer userId) {
        return conversationRepository.findByParticipantId(userId);
    }

    public List<ConversationPreviewDto> getUserConversationPreviews(Integer userId) {
        List<Conversation> convos = conversationRepository.findByParticipantId(userId);

        return convos.stream().map(c -> {
            Message last = messageRepository
                    .findTopByConversationIdOrderByCreatedAtDesc(c.getId())
                    .orElse(null);
            String lastMessage = (last != null)
                    ? last.getSender().getName() + ": " + last.getContent()
                    : "Brak wiadomości";

            String name;
            String avatarUrl;

            if (c.getType() == ConversationType.EVENT) {
                name = c.getEvent() != null ? c.getEvent().getEventName() : "Czat wydarzenia";
                avatarUrl = c.getEvent() != null ? c.getEvent().getImageUrl() : null;
            } else if (c.getType() == ConversationType.TEAM) {
                name = c.getTeam() != null ? c.getTeam().getName() : "Czat drużyny";
                avatarUrl = c.getTeam() != null ? c.getTeam().getPhotoUrl() : null;
            } else {
                User other = c.getParticipants().stream()
                        .filter(u -> !u.getId().equals(userId))
                        .findFirst()
                        .orElse(null);
                name = other != null ? other.getName() : "Rozmowa prywatna";
                avatarUrl = other != null ? other.getUrlOfPicture() : null;
            }

            long unread = messageRepository.countUnreadMessages(c.getId(), userId);

            return new ConversationPreviewDto(
                    c.getId(),
                    name,
                    avatarUrl,
                    lastMessage,
                    (int) unread
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto createTeamConversation(Integer teamId) {
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Optional<Conversation> existing = conversationRepository.findByTeamId(teamId);
        if (existing.isPresent()) {
            return mapToConversationDto(existing.get());
        }

        List<User> participants = team.getUserTeams().stream()
                .map(UserTeam::getUser)
                .toList();

        Conversation conversation = Conversation.builder()
                .type(ConversationType.TEAM)
                .team(team)
                .participants(participants)
                .build();

        Conversation saved = conversationRepository.save(conversation);
        return mapToConversationDto(saved);
    }

    @Transactional
    public ConversationDto createEventConversation(Integer eventId) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Optional<Conversation> existing = conversationRepository.findByEventEventId(eventId);
        if (existing.isPresent()) {
            return mapToConversationDto(existing.get());
        }

        List<User> participants = event.getUserEvents().stream()
                .map(UserEvent::getUser)
                .toList();

        Conversation conversation = Conversation.builder()
                .type(ConversationType.EVENT)
                .event(event)
                .participants(participants)
                .build();

        Conversation saved = conversationRepository.save(conversation);
        return mapToConversationDto(saved);
    }

    @Transactional
    public void addUserToEventChat(Integer eventId, Integer userId) {
        var convOpt = conversationRepository.findByEventEventId(eventId);
        if (convOpt.isEmpty()) return;

        Conversation conv = convOpt.get();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!conv.getParticipants().contains(user)) {
            conv.getParticipants().add(user);
            conversationRepository.save(conv);
        }
    }

    @Transactional
    public void removeUserFromEventChat(Integer eventId, Integer userId) {
        var convOpt = conversationRepository.findByEventEventId(eventId);
        if (convOpt.isEmpty()) return;

        Conversation conv = convOpt.get();
        conv.setParticipants(
                conv.getParticipants().stream()
                        .filter(u -> !u.getId().equals(userId))
                        .collect(Collectors.toList())
        );
        conversationRepository.save(conv);
    }

    @Transactional
    public void addUserToTeamChat(Integer teamId, Integer userId) {
        var convOpt = conversationRepository.findByTeamId(teamId);
        if (convOpt.isEmpty()) return;

        Conversation conv = convOpt.get();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean already = conv.getParticipants().stream().anyMatch(u -> u.getId().equals(userId));
        if (!already) {
            conv.getParticipants().add(user);
            conversationRepository.save(conv);
        }
    }

    @Transactional
    public void removeUserFromTeamChat(Integer teamId, Integer userId) {
        var convOpt = conversationRepository.findByTeamId(teamId);
        if (convOpt.isEmpty()) return;

        Conversation conv = convOpt.get();
        conv.getParticipants().removeIf(u -> u.getId().equals(userId));
        conversationRepository.save(conv);
    }

    @Transactional
    public void markMessagesAsRead(Integer conversationId, Integer userId, Integer lastMessageId) {

        List<Message> messages = messageRepository
                .findUnreadMessages(conversationId, userId, lastMessageId);

        User user = userRepository.findById(userId)
                .orElseThrow();

        for (Message m : messages) {
            if (messageReadRepository.existsByMessageIdAndUserId(m.getId(), userId)) {
                continue;
            }

            messageReadRepository.save(
                    MessageRead.builder()
                            .message(m)
                            .user(user)
                            .readAt(LocalDateTime.now())
                            .build()
            );
        }

    }
    public long countTotalUnread(Integer userId) {
        List<Conversation> convos = conversationRepository.findByParticipantId(userId);

        long total = 0;
        for (Conversation c : convos) {
            total += messageRepository.countUnreadMessages(c.getId(), userId);
        }
        return total;
    }

}