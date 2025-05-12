package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventVisibilityRequestDto;
import com.joinmatch.backend.dto.EventVisibilityResponseDto;
import com.joinmatch.backend.entity.EventVisibility;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventVisibilityService {
    private final EntityManager entityManager;

    @SuppressWarnings("unchecked")
    public List<EventVisibilityResponseDto> findAll() {
        return entityManager
                .createNativeQuery("SELECT * FROM event_visibility;", EventVisibility.class)
                .getResultList()
                .stream()
                .map(ev -> new EventVisibilityResponseDto(((EventVisibility) ev).getId(), ((EventVisibility) ev).getName()))
                .toList();
    }

    @SuppressWarnings("unchecked")
    public Optional<EventVisibilityResponseDto> findById(Integer id) {
        return entityManager
                .createNativeQuery("SELECT * FROM event_visibility WHERE id = (:id)", EventVisibility.class)
                .setParameter("id", id)
                .getResultList()
                .stream()
                .findFirst()
                .map(ev -> {
                    EventVisibility eventVisibility = (EventVisibility) ev;
                    return new EventVisibilityResponseDto(eventVisibility.getId(), eventVisibility.getName());
                });

    }

    @Transactional
    public void deleteById(Integer id) {
        entityManager
                .createNativeQuery("DELETE FROM event_visibility WHERE id = (:id)", EventVisibility.class)
                .setParameter("id", id)
                .executeUpdate();
    }

    @Transactional
    public EventVisibilityResponseDto create(EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibility eventVisibility = (EventVisibility) entityManager
                .createNativeQuery("INSERT INTO event_visibility (name) VALUES (:name) RETURNING *", EventVisibility.class)
                .setParameter("name", eventVisibilityRequestDto.name())
                .getSingleResult();

        return new EventVisibilityResponseDto(eventVisibility.getId(), eventVisibility.getName());
    }

    @Transactional
    public EventVisibilityResponseDto update(Integer id, EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibility eventVisibility = (EventVisibility) entityManager
                .createNativeQuery("UPDATE event_visibility SET name = (:name) WHERE id = (:id) RETURNING *", EventVisibility.class)
                .setParameter("name", eventVisibilityRequestDto.name())
                .setParameter("id", id)
                .getSingleResult();

        return new EventVisibilityResponseDto(eventVisibility.getId(), eventVisibility.getName());
    }
}
