package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.dto.Message.ConversationDto;
import com.joinmatch.backend.dto.Message.ConversationPreviewDto;
import com.joinmatch.backend.dto.Message.ParticipantDto;
import com.joinmatch.backend.enums.ConversationType;
import com.joinmatch.backend.model.Conversation;
import com.joinmatch.backend.model.Message;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.joinmatch.backend.model.UserEvent;
import com.joinmatch.backend.model.UserTeam;

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
            User other = c.getParticipants().stream()
                    .filter(u -> !u.getId().equals(userId))
                    .findFirst()
                    .orElse(null);

            Message last = messageRepository
                    .findTopByConversationIdOrderByCreatedAtDesc(c.getId())
                    .orElse(null);

            String lastMessage = (last != null)
                    ? last.getSender().getName() + ": " + last.getContent()
                    : "Brak wiadomości";

            return new ConversationPreviewDto(
                    c.getId(),
                    other != null ? other.getName() : "Rozmowa prywatna",
                    other != null ? other.getUrlOfPicture() : null,
                    lastMessage
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

        Optional<Conversation> existing = conversationRepository.findByEventId(eventId);
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


}
