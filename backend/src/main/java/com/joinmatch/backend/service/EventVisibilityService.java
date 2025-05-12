package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventVisibilityRequestDto;
import com.joinmatch.backend.dto.EventVisibilityResponseDto;
import com.joinmatch.backend.entity.EventVisibility;
import com.joinmatch.backend.repository.EventVisibilityRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventVisibilityService {
    private final EventVisibilityRepository repository;

    public List<EventVisibilityResponseDto> findAll() {
        return repository.findAll()
                .stream()
                .map(ev -> new EventVisibilityResponseDto(ev.getId(), ev.getName()))
                .toList();
    }

    public Optional<EventVisibilityResponseDto> findById(Integer id) {
        return repository.findById(id)
                .map(ev -> new EventVisibilityResponseDto(ev.getId(), ev.getName()));

    }

    @Transactional
    public void deleteById(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("EventVisibility with id " + id + " not found");
        }
        repository.deleteById(id);
    }

    @Transactional
    public EventVisibilityResponseDto create(EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibility eventVisibility = new EventVisibility();
        eventVisibility.setName(eventVisibilityRequestDto.name());
        EventVisibility saved = repository.save(eventVisibility);
        return new EventVisibilityResponseDto(saved.getId(), saved.getName());
    }

    @Transactional
    public EventVisibilityResponseDto update(Integer id, EventVisibilityRequestDto eventVisibilityRequestDto) {
        EventVisibility eventVisibility = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("EventVisibility with id " + id + " not found"));
        eventVisibility.setName(eventVisibilityRequestDto.name());
        EventVisibility updated = repository.save(eventVisibility);
        return new EventVisibilityResponseDto(updated.getId(), updated.getName());
    }
}
