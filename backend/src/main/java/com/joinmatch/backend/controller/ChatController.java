package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.dto.Message.ConversationDto;
import com.joinmatch.backend.dto.Message.ConversationPreviewDto;
import com.joinmatch.backend.model.Conversation;
import com.joinmatch.backend.model.Message;
import com.joinmatch.backend.repository.MessageRepository;
import com.joinmatch.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessage) {
        ChatMessageDto savedMessage = chatService.saveMessage(chatMessage);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + chatMessage.conversationId(),
                savedMessage
        );
    }

    @GetMapping("/conversations/{id}/messages")
    @ResponseBody
    public List<ChatMessageDto> getMessages(@PathVariable Integer id) {
        return chatService.getMessagesByConversation(id);
    }

    @PostMapping("/conversations/direct")
    @ResponseBody
    public ConversationDto createDirectConversation(@RequestParam Integer user1Id, @RequestParam Integer user2Id) {
        return chatService.createDirectConversationDto(user1Id, user2Id);
    }

    @GetMapping("/conversations/all")
    @ResponseBody
    public List<Conversation> getUserConversations(@RequestParam Integer userId) {
        return chatService.getUserConversations(userId);
    }

    @GetMapping("/conversations/preview")
    @ResponseBody
    public List<ConversationPreviewDto> getUserConversationPreviews(@RequestParam Integer userId) {
        return chatService.getUserConversationPreviews(userId);
    }
    @PostMapping("/team/{teamId}")
    public ResponseEntity<ConversationDto> createTeamChat(@PathVariable Integer teamId) {
        return ResponseEntity.ok(chatService.createTeamConversation(teamId));
    }

    @PostMapping("/event/{eventId}")
    public ResponseEntity<ConversationDto> createEventChat(@PathVariable Integer eventId) {
        return ResponseEntity.ok(chatService.createEventConversation(eventId));
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Integer conversationId,
            @RequestParam Integer userId,
            @RequestParam(required = false) Integer lastMessageId
    ) {
        if (lastMessageId == null) {
            Message last = messageRepository
                    .findTopByConversationIdOrderByCreatedAtDesc(conversationId)
                    .orElse(null);

            if (last != null) {
                lastMessageId = last.getId();
            }
        }

        chatService.markMessagesAsRead(conversationId, userId, lastMessageId);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/conversations/unread-count")
    @ResponseBody
    public long getTotalUnread(@RequestParam Integer userId) {
        return chatService.countTotalUnread(userId);
    }

}
