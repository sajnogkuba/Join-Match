package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.SportObjectRequestDto;
import com.joinmatch.backend.dto.SportObjectResponseDto;
import com.joinmatch.backend.entity.SportObject;
import com.joinmatch.backend.service.SportObjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sport-object")
@RequiredArgsConstructor
public class SportObjectController {
    private final SportObjectService sportObjectService;

    @GetMapping
    public ResponseEntity<List<SportObjectResponseDto>> getAllSportObjects() {
        List<SportObjectResponseDto> allSportObjects = sportObjectService.getAll();
        return ResponseEntity.ok(allSportObjects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SportObjectResponseDto> getSportObjectById(@PathVariable Integer id) {
        SportObjectResponseDto sportObject = sportObjectService.getById(id);
        return ResponseEntity.ok(sportObject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSportObject(@PathVariable Integer id) {
        sportObjectService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SportObjectResponseDto> createSportObject(@RequestBody @Valid SportObjectRequestDto sportObjectRequestDto) {
        SportObjectResponseDto createdSportObject = sportObjectService.create(sportObjectRequestDto);
        return ResponseEntity.status(201).body(createdSportObject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SportObjectResponseDto> updateSportObject(@PathVariable Integer id, @RequestBody @Valid SportObjectRequestDto sportObjectRequestDto) {
        SportObjectResponseDto updatedSportObject = sportObjectService.update(id, sportObjectRequestDto);
        return ResponseEntity.ok(updatedSportObject);
    }
}
