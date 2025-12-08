package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Sport.*;
import com.joinmatch.backend.service.SportService;
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
    public ResponseEntity<List<SportTypeResponseDto>> getAllSports() {
        List<SportTypeResponseDto> events = sportService.getAllSportTypes();
        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(events);
    }
    @GetMapping("/user")
    public ResponseEntity<SportResponse> getSportsByUser(@RequestParam String token){
        List<SportWithRatingDto> sports = sportService.getSportsForUser(token);
        return ResponseEntity.ok(new SportResponse(sports));
    }
    @PostMapping("/user")
    public ResponseEntity<Void> addSportForUser(@RequestBody NewSportForUserDto newSportForUserDto){
        try {
            sportService.addNewSportForUser(newSportForUserDto.token(), newSportForUserDto.sportId(), newSportForUserDto.rating());
        }catch (IllegalArgumentException illegalArgumentException){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PostMapping
    public ResponseEntity<SportDto> createNewSport(@RequestBody SportDto sportDto){

        return ResponseEntity.status(201).body(sportDto);
    }
    @PatchMapping("/mainSport")
    public ResponseEntity<Void> setNewMainSport(@RequestBody MainSportDto mainSportDto){
        try{
            sportService.setMainSport(mainSportDto.email(),mainSportDto.idSport());
        }catch (IllegalArgumentException illegalArgumentException){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/user/sport")
    public ResponseEntity<Void> removeSportForUser(@RequestBody RemoveSportDto removeSportDto){
        try{
            sportService.removeSport(removeSportDto);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
}
