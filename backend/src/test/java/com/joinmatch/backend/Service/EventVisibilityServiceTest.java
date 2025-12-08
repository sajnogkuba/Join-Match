package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.EventVisibility.EventVisibilityRequestDto;
import com.joinmatch.backend.dto.EventVisibility.EventVisibilityResponseDto;
import com.joinmatch.backend.model.EventVisibility;
import com.joinmatch.backend.repository.EventVisibilityRepository;
import com.joinmatch.backend.service.EventVisibilityService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventVisibilityServiceTest {

    @Mock
    private EventVisibilityRepository repository;

    @InjectMocks
    private EventVisibilityService service;

    // -----------------------------
    // getAll()
    // -----------------------------
    @Test
    void getAll_shouldReturnMappedList() {
        EventVisibility ev1 = new EventVisibility(1, "Public");
        EventVisibility ev2 = new EventVisibility(2, "Private");

        when(repository.findAll()).thenReturn(List.of(ev1, ev2));

        List<EventVisibilityResponseDto> result = service.getAll();

        assertEquals(2, result.size());
        assertEquals("Public", result.get(0).name());
        assertEquals("Private", result.get(1).name());
    }

    // -----------------------------
    // getById()
    // -----------------------------
    @Test
    void getById_shouldReturnDto_ifExists() {
        EventVisibility ev = new EventVisibility(3, "Friends");

        when(repository.findById(3)).thenReturn(Optional.of(ev));

        EventVisibilityResponseDto result = service.getById(3);

        assertEquals(3, result.id());
        assertEquals("Friends", result.name());
    }

    @Test
    void getById_shouldThrow_ifNotFound() {
        when(repository.findById(999)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.getById(999));
    }

    // -----------------------------
    // deleteById()
    // -----------------------------
    @Test
    void deleteById_shouldDelete_ifExists() {
        when(repository.existsById(10)).thenReturn(true);

        service.deleteById(10);

        verify(repository).deleteById(10);
    }

    @Test
    void deleteById_shouldThrow_ifNotExists() {
        when(repository.existsById(10)).thenReturn(false);

        assertThrows(EntityNotFoundException.class,
                () -> service.deleteById(10));
    }

    // -----------------------------
    // create()
    // -----------------------------
    @Test
    void create_shouldSaveAndReturnDto() {
        EventVisibilityRequestDto req = new EventVisibilityRequestDto("Public");

        EventVisibility saved = new EventVisibility(1, "Public");

        when(repository.save(any(EventVisibility.class))).thenReturn(saved);

        EventVisibilityResponseDto result = service.create(req);

        assertEquals(1, result.id());
        assertEquals("Public", result.name());
    }

    // -----------------------------
    // update()
    // -----------------------------
    @Test
    void update_shouldModifyAndReturnDto() {
        EventVisibility existing = new EventVisibility(5, "OldName");
        EventVisibilityRequestDto req = new EventVisibilityRequestDto("NewName");

        EventVisibility updated = new EventVisibility(5, "NewName");

        when(repository.findById(5)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(updated);

        EventVisibilityResponseDto result = service.update(5, req);

        assertEquals(5, result.id());
        assertEquals("NewName", result.name());
    }

    @Test
    void update_shouldThrow_ifNotFound() {
        when(repository.findById(123)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.update(123, new EventVisibilityRequestDto("X")));
    }
}
