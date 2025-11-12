package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
    @Query("""
    SELECT c FROM Conversation c
    JOIN c.participants p1
    JOIN c.participants p2
    WHERE c.type = 'PRIVATE'
      AND p1.id = :user1Id
      AND p2.id = :user2Id
""")
    Optional<Conversation> findDirectBetweenUsers(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);

    @Query("""
    SELECT DISTINCT c FROM Conversation c
    JOIN c.participants p
    WHERE p.id = :userId
""")
    List<Conversation> findByParticipantId(@Param("userId") Integer userId);

    Optional<Conversation> findByTeamId(Integer teamId);
    Optional<Conversation> findByEventId(Integer eventId);


}
