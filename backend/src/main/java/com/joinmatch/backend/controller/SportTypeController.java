package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.SportDto;
import com.joinmatch.backend.dto.SportTypeResponseDto;
import com.joinmatch.backend.service.SportService;
import com.joinmatch.backend.service.SportTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sport-type")
@RequiredArgsConstructor
public class SportTypeController {
    private final SportService sportService;

    @GetMapping
    public ResponseEntity<List<SportTypeResponseDto>> getAllEvents() {
        List<SportTypeResponseDto> events = sportService.getAllSportTypes();
        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(events);
    }
    @PostMapping
    public ResponseEntity<SportDto> createNewSport(@RequestBody SportDto sportDto){

        return ResponseEntity.status(201).body(sportDto);
    }
}
