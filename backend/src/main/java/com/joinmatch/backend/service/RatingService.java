package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventRating.EventRatingRequestDto;
import com.joinmatch.backend.dto.EventRating.EventRatingResponseDto;
import com.joinmatch.backend.dto.UserRating.UserRatingRequestDto;
import com.joinmatch.backend.dto.UserRating.UserRatingResponseDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final UserRatingRepository userRatingRepository;
    private final EventRatingRepository eventRatingRepository;
    private final UserEventRepository userEventRepository;

    @Transactional
    public UserRatingResponseDto addUserRating(UserRatingRequestDto request) {
        User rater = userRepository.findById(request.raterId())
                .orElseThrow(() -> new RuntimeException("Rater not found"));
        User rated = userRepository.findById(request.ratedId())
                .orElseThrow(() -> new RuntimeException("Rated user not found"));

        boolean alreadyRated = userRatingRepository.existsByRaterAndRated(rater, rated);
        if (alreadyRated) {
            throw new RuntimeException("Nie możesz ocenić tego użytkownika ponownie");
        }

        boolean canRate = userEventRepository.haveCommonEventOrOrganizer(rater.getId(), rated.getId());
        if (!canRate) {
            throw new RuntimeException("Nie możesz ocenić tego użytkownika – brak wspólnego wydarzenia");
        }

        UserRating rating = UserRating.builder()
                .rater(rater)
                .rated(rated)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        userRatingRepository.save(rating);

        return new UserRatingResponseDto(
                rating.getUserRateId(),
                rater.getEmail(),
                rating.getRating(),
                rating.getComment(),
                rater.getName(),
                rating.getCreatedAt(),
                rater.getUrlOfPicture()
        );
    }

    public List<UserRatingResponseDto> getRatingsByUser(Integer userId) {
        return userRatingRepository.findByRated_Id(userId)
                .stream()
                .map(r -> new UserRatingResponseDto(
                        r.getUserRateId(),
                        r.getRater().getEmail(),
                        r.getRating(),
                        r.getComment(),
                        r.getRater().getName(),
                        r.getCreatedAt(),
                        r.getRater().getUrlOfPicture()
                ))
                .toList();
    }
    @Transactional
    public EventRatingResponseDto addEventRating(EventRatingRequestDto request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean alreadyRated = eventRatingRepository.existsByUserAndEvent(user, event);
        if (alreadyRated) {
            throw new RuntimeException("Nie możesz ocenić tego wydarzenia więcej niż raz");
        }

        boolean participated = userEventRepository.existsByUserAndEvent(user, event);
        if (!participated) {
            throw new RuntimeException("Nie możesz ocenić wydarzenia, w którym nie brałeś udziału");
        }

        EventRating rating = EventRating.builder()
                .user(user)
                .event(event)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        eventRatingRepository.save(rating);

        return new EventRatingResponseDto(
                rating.getEventRatingId(),
                rating.getRating(),
                rating.getComment(),
                user.getName(),
                rating.getCreatedAt()
        );
    }

    public Double getAverageUserRating(Integer userId) {
        return userRatingRepository.getAverageUserRating(userId);
    }


    public List<EventRatingResponseDto> getRatingsByEvent(Integer eventId) {
        return eventRatingRepository.findByEvent_EventId(eventId)
                .stream()
                .map(r -> new EventRatingResponseDto(
                        r.getEventRatingId(),
                        r.getRating(),
                        r.getComment(),
                        r.getUser().getName(),
                        r.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public UserRatingResponseDto updateUserRating(Integer ratingId, UserRatingRequestDto request, Integer currentUserId) {
        UserRating existingRating = userRatingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!existingRating.getRater().getId().equals(currentUserId)) {
            throw new RuntimeException("You can only edit your own ratings");
        }

        existingRating.setRating(request.rating());
        existingRating.setComment(request.comment());

        userRatingRepository.save(existingRating);

        return new UserRatingResponseDto(
                existingRating.getUserRateId(),
                existingRating.getRater().getEmail(),
                existingRating.getRating(),
                existingRating.getComment(),
                existingRating.getRater().getName(),
                existingRating.getCreatedAt(),
                existingRating.getRater().getUrlOfPicture()
        );
    }

    @Transactional
    public void deleteUserRating(Integer ratingId, Integer currentUserId) {
        UserRating rating = userRatingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!rating.getRater().getId().equals(currentUserId)) {
            throw new RuntimeException("You can only delete your own ratings");
        }

        userRatingRepository.delete(rating);
    }

    @Transactional
    public EventRatingResponseDto updateEventRating(Integer ratingId, EventRatingRequestDto request, Integer currentUserId) {
        EventRating existingRating = eventRatingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!existingRating.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You can only edit your own ratings");
        }

        existingRating.setRating(request.rating());
        existingRating.setComment(request.comment());

        eventRatingRepository.save(existingRating);

        return new EventRatingResponseDto(
                existingRating.getEventRatingId(),
                existingRating.getRating(),
                existingRating.getComment(),
                existingRating.getUser().getName(),
                existingRating.getCreatedAt()
        );
    }

    @Transactional
    public void deleteEventRating(Integer ratingId, Integer currentUserId) {
        EventRating rating = eventRatingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!rating.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You can only delete your own ratings");
        }

        eventRatingRepository.delete(rating);
    }

}
