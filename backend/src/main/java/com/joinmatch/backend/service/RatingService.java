package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.*;
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
}
