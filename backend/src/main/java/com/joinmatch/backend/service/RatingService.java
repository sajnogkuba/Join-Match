package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventRatingRequestDto;
import com.joinmatch.backend.dto.UserRatingRequestDto;
import com.joinmatch.backend.model.Event;
import com.joinmatch.backend.model.EventRating;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserRating;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final UserRatingRepository userRatingRepository;
    private final EventRatingRepository eventRatingRepository;
    private final UserEventRepository userEventRepository;

    @Transactional
    public UserRating addUserRating(UserRatingRequestDto request) {
        User rater = userRepository.findById(request.raterId())
                .orElseThrow(() -> new RuntimeException("Rater not found"));
        User rated = userRepository.findById(request.ratedId())
                .orElseThrow(() -> new RuntimeException("Rated user not found"));

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

        return userRatingRepository.save(rating);
    }

    @Transactional
    public EventRating addEventRating(EventRatingRequestDto request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

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

        return eventRatingRepository.save(rating);
    }
}