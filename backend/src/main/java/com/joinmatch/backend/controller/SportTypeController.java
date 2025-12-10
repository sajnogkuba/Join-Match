package com.joinmatch.backend.controller;

import com.joinmatch.backend.config.TokenExtractor;
import com.joinmatch.backend.dto.Sport.*;
import com.joinmatch.backend.service.SportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

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
    public ResponseEntity<SportResponse> getSportsByUser(HttpServletRequest request){
        String token = TokenExtractor.extractToken(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<SportWithRatingDto> sports = sportService.getSportsForUser(token);
        return ResponseEntity.ok(new SportResponse(sports));
    }
    @PostMapping("/user")
    public ResponseEntity<Void> addSportForUser(@RequestBody NewSportForUserDto newSportForUserDto, HttpServletRequest request){
        try {
            sportService.addNewSportForUser(newSportForUserDto.sportId(), newSportForUserDto.rating(), request);
        }catch (IllegalArgumentException illegalArgumentException){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PostMapping
    public ResponseEntity<SportDto> createNewSport(@RequestBody SportDto sportDto){
            sportService.addNewSport(sportDto);
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
    public ResponseEntity<Void> removeSportForUser(@RequestBody RemoveSportDto removeSportDto, HttpServletRequest request){
        try{
            sportService.removeSport(removeSportDto, request);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/updateName")
    public ResponseEntity<Void> renameSport(@RequestBody ChangeNameOfSportDto changeNameOfSportDto){
        try{
            sportService.renameSport(changeNameOfSportDto);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/deleteSport/{idOfSport}")
    public ResponseEntity<Void> deleteSport (@PathVariable Integer idOfSport){
        try{
            sportService.deleteSport(idOfSport);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.notFound().build();
        }catch (RuntimeException e){
            return ResponseEntity.status(409).build();
        }
        return ResponseEntity.ok().build();
    }
}
