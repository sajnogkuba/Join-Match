package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.EventRating.EventRatingRequestDto;
import com.joinmatch.backend.dto.EventRating.EventRatingResponseDto;
import com.joinmatch.backend.dto.OrganizerRating.OrganizerRatingRequestDto;
import com.joinmatch.backend.dto.OrganizerRating.OrganizerRatingResponseDto;
import com.joinmatch.backend.dto.Reports.EventRatingReportDto;
import com.joinmatch.backend.dto.Reports.UserRatingReportDto;
import com.joinmatch.backend.dto.UserRating.UserRatingRequestDto;
import com.joinmatch.backend.dto.UserRating.UserRatingResponseDto;
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
    @PutMapping("/user/{ratingId}")
    public ResponseEntity<UserRatingResponseDto> updateUserRating(
            @PathVariable Integer ratingId,
            @RequestBody UserRatingRequestDto request,
            @RequestParam Integer userId) {
        UserRatingResponseDto response = ratingService.updateUserRating(ratingId, request, userId);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/user/{ratingId}")
    public ResponseEntity<Void> deleteUserRating(
            @PathVariable Integer ratingId,
            @RequestParam Integer userId) {
        ratingService.deleteUserRating(ratingId, userId);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/event/{ratingId}")
    public ResponseEntity<EventRatingResponseDto> updateEventRating(
            @PathVariable Integer ratingId,
            @RequestBody EventRatingRequestDto request,
            @RequestParam Integer userId) {
        EventRatingResponseDto response = ratingService.updateEventRating(ratingId, request, userId);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/event/{ratingId}")
    public ResponseEntity<Void> deleteEventRating(
            @PathVariable Integer ratingId,
            @RequestParam Integer userId) {
        ratingService.deleteEventRating(ratingId, userId);
        return ResponseEntity.noContent().build();
    }
    @PostMapping
    public ResponseEntity<OrganizerRatingResponseDto> addOrganizerRating(@RequestBody OrganizerRatingRequestDto request) {
        OrganizerRatingResponseDto response = ratingService.addOrganizerRating(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{organizerId}")
    public ResponseEntity<List<OrganizerRatingResponseDto>> getOrganizerRatings(@PathVariable Integer organizerId) {
        List<OrganizerRatingResponseDto> ratings = ratingService.getRatingsByOrganizer(organizerId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/{organizerId}/average")
    public ResponseEntity<Double> getAverageOrganizerRating(@PathVariable Integer organizerId) {
        Double avg = ratingService.getAverageOrganizerRating(organizerId);
        return ResponseEntity.ok(avg != null ? avg : 0.0);
    }
    @PutMapping("/organizer/{ratingId}")
    public ResponseEntity<OrganizerRatingResponseDto> updateOrganizerRating(
            @PathVariable Integer ratingId,
            @RequestBody OrganizerRatingRequestDto request,
            @RequestParam Integer userId) {
        OrganizerRatingResponseDto response = ratingService.updateOrganizerRating(ratingId, request, userId);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/organizer/{ratingId}")
    public ResponseEntity<Void> deleteOrganizerRating(
            @PathVariable Integer ratingId,
            @RequestParam Integer userId) {
        ratingService.deleteOrganizerRating(ratingId, userId);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("report/eventRating")
    public ResponseEntity<Void> reportEventRating(@RequestBody EventRatingReportDto reportDto){
        try {
            ratingService.reportEventRating(reportDto);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PostMapping("/report/userRating")
    public ResponseEntity<Void> reportUserRating(@RequestBody UserRatingReportDto userRatingReportDto){
        try {
            ratingService.reportUserRating(userRatingReportDto);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
}
