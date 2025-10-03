package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.UserSavedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSavedEventRepository extends JpaRepository<UserSavedEvent, Integer> {
    List<UserSavedEvent> findByUserId(Integer id);

    UserSavedEvent findByUserIdAndEventEventId(Integer userId, Integer eventId);
}
