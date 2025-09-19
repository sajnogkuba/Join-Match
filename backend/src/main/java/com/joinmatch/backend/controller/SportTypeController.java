package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.SportTypeResponseDto;
import com.joinmatch.backend.service.SportTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sport-type")
@RequiredArgsConstructor
public class SportTypeController {
    private final SportTypeService sportTypeService;

    @GetMapping
    public ResponseEntity<List<SportTypeResponseDto>> getAllEvents() {
        List<SportTypeResponseDto> events = sportTypeService.getAllSportTypes();
        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(events);
    }
}
