package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventRatingRequestDto;
import com.joinmatch.backend.dto.EventRatingResponseDto;
import com.joinmatch.backend.dto.UserRatingRequestDto;
import com.joinmatch.backend.dto.UserRatingResponseDto;
import com.joinmatch.backend.model.EventRating;
import com.joinmatch.backend.model.UserRating;
import com.joinmatch.backend.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/user")
    public ResponseEntity<UserRatingResponseDto> addUserRating(@RequestBody UserRatingRequestDto request) {
        UserRatingResponseDto response = ratingService.addUserRating(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserRatingResponseDto>> getUserRatings(@PathVariable Integer userId) {
        List<UserRatingResponseDto> ratings = ratingService.getRatingsByUser(userId);
        return ResponseEntity.ok(ratings);
    }

    @PostMapping("/event")
    public ResponseEntity<EventRatingResponseDto> addEventRating(@RequestBody EventRatingRequestDto request) {
        EventRatingResponseDto response = ratingService.addEventRating(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventRatingResponseDto>> getRatingsByEvent(@PathVariable Integer eventId) {
        List<EventRatingResponseDto> ratings = ratingService.getRatingsByEvent(eventId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Double> getAverageUserRating(@PathVariable Integer userId) {
        Double average = ratingService.getAverageUserRating(userId);
        return ResponseEntity.ok(average != null ? average : 0.0);
    }
}
