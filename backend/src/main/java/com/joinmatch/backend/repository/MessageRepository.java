package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);
}
