package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);

    Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(Integer conversationId);

    @Query("""
        SELECT m FROM Message m 
        WHERE m.conversation.id = :cid 
          AND m.id <= :lastMessageId
          AND m.id NOT IN (
             SELECT mr.message.id 
             FROM MessageRead mr 
             WHERE mr.user.id = :uid
          )
    """)
    List<Message> findUnreadMessages(
            @Param("cid") Integer conversationId,
            @Param("uid") Integer userId,
            @Param("lastMessageId") Integer lastMessageId
    );

    @Query("""
    SELECT COUNT(m) FROM Message m
    LEFT JOIN MessageRead mr 
        ON mr.message = m AND mr.user.id = :uid
    WHERE m.conversation.id = :cid
      AND mr.id IS NULL
""")
    long countUnreadMessages(
            @Param("cid") Integer conversationId,
            @Param("uid") Integer userId
    );

}
