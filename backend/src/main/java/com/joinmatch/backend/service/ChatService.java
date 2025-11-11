package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.dto.Message.ConversationDto;
import com.joinmatch.backend.dto.Message.ParticipantDto;
import com.joinmatch.backend.enums.ConversationType;
import com.joinmatch.backend.model.Conversation;
import com.joinmatch.backend.model.Message;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.ConversationRepository;
import com.joinmatch.backend.repository.MessageRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

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

        return new ConversationDto(conversation.getId(), conversation.getType().name(), participants);
    }
    public List<Conversation> getUserConversations(Integer userId) {
        return conversationRepository.findByParticipantId(userId);
    }

}
