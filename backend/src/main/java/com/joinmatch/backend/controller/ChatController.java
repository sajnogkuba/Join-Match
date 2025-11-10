package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Message.ChatMessageDto;
import com.joinmatch.backend.model.Conversation;
import com.joinmatch.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
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
    public Conversation createDirectConversation(@RequestParam Integer user1Id, @RequestParam Integer user2Id) {
        return chatService.createDirectConversation(user1Id, user2Id);
    }

}
