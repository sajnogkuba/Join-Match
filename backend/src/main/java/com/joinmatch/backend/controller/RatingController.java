package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventRatingRequestDto;
import com.joinmatch.backend.dto.UserRatingRequestDto;
import com.joinmatch.backend.model.EventRating;
import com.joinmatch.backend.model.UserRating;
import com.joinmatch.backend.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/user")
    public UserRating addUserRating(@RequestBody UserRatingRequestDto request) {
        return ratingService.addUserRating(request);
    }

    @PostMapping("/event")
    public EventRating addEventRating(@RequestBody EventRatingRequestDto request) {
        return ratingService.addEventRating(request);
    }
}
