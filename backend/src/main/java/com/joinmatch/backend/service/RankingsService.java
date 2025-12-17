package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Rankings.UserRankingResponseDto;
import com.joinmatch.backend.repository.UserRatingRepository;
import com.joinmatch.backend.repository.UserEventRepository;
import com.joinmatch.backend.repository.SportObjectRepository;
import com.joinmatch.backend.repository.OrganizerRatingRepository;
import com.joinmatch.backend.repository.EventRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RankingsService {

    private final UserRatingRepository userRatingRepository;
    private final UserEventRepository userEventRepository;
    private final SportObjectRepository sportObjectRepository;
    private final OrganizerRatingRepository organizerRatingRepository;
    private final EventRepository eventRepository;

    public List<UserRankingResponseDto> getGeneralUserRanking(Integer limit, Integer minRatings) {
        List<Object[]> results = userRatingRepository.findTopUsersByRating(limit, minRatings);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            Double avgRating = ((Number) row[4]).doubleValue();
            long totalRatings = ((Number) row[5]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    avgRating, (int) totalRatings, position++
            ));
        }

        return ranking;
    }

    public List<UserRankingResponseDto> getActivityUserRanking(Integer limit) {
        List<Object[]> results = userEventRepository.findTopUsersByActivity(limit);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            long eventCount = ((Number) row[4]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    null, (int) eventCount, position++
            ));
        }

        return ranking;
    }

    public List<String> getAvailableCities() {
        return sportObjectRepository.findDistinctCitiesFromEvents();
    }

    public List<UserRankingResponseDto> getLocalUserRanking(String city, Integer limit) {
        List<Object[]> results = userEventRepository.findTopUsersByLocalActivity(city, limit);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            long eventCount = ((Number) row[4]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    null, (int) eventCount, position++
            ));
        }

        return ranking;
    }

    public List<UserRankingResponseDto> getGeneralOrganizerRanking(Integer limit, Integer minRatings) {
        List<Object[]> results = organizerRatingRepository.findTopOrganizersByRating(limit, minRatings);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            Double avgRating = ((Number) row[4]).doubleValue();
            long totalRatings = ((Number) row[5]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    avgRating, (int) totalRatings, position++
            ));
        }

        return ranking;
    }

    public List<UserRankingResponseDto> getActivityOrganizerRanking(Integer limit) {
        List<Object[]> results = eventRepository.findTopOrganizersByActivity(limit);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            long eventCount = ((Number) row[4]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    null, (int) eventCount, position++
            ));
        }

        return ranking;
    }

    public List<UserRankingResponseDto> getLocalOrganizerRanking(String city, Integer limit) {
        List<Object[]> results = eventRepository.findTopOrganizersByLocalActivity(city, limit);

        List<UserRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            long eventCount = ((Number) row[4]).longValue();

            ranking.add(new UserRankingResponseDto(
                    userId, name, email, avatarUrl,
                    null, (int) eventCount, position++
            ));
        }

        return ranking;
    }
}
