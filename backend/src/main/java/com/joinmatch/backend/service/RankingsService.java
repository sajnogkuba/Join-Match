package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Rankings.UserRankingResponseDto;
import com.joinmatch.backend.repository.UserRatingRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RankingsService {

    private final UserRatingRepository userRatingRepository;

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
}
