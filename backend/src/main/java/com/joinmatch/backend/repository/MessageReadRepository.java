package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.MessageRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageReadRepository extends JpaRepository<MessageRead, Integer> {
    boolean existsByMessageIdAndUserId(Integer messageId, Integer userId);

}
