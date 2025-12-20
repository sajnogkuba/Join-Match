package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Rankings.UserRankingResponseDto;
import com.joinmatch.backend.dto.Rankings.TeamRankingResponseDto;
import com.joinmatch.backend.dto.Rankings.EventRankingResponseDto;
import com.joinmatch.backend.dto.Rankings.BadgeRankingResponseDto;
import com.joinmatch.backend.repository.UserRatingRepository;
import com.joinmatch.backend.repository.UserEventRepository;
import com.joinmatch.backend.repository.SportObjectRepository;
import com.joinmatch.backend.repository.OrganizerRatingRepository;
import com.joinmatch.backend.repository.EventRepository;
import com.joinmatch.backend.repository.TeamRepository;
import com.joinmatch.backend.repository.UserBadgeRepository;
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
    private final TeamRepository teamRepository;
    private final UserBadgeRepository userBadgeRepository;

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

    public List<TeamRankingResponseDto> getGeneralTeamRanking(Integer limit) {
        List<Object[]> results = teamRepository.findTopTeamsByMemberCount(limit);

        List<TeamRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer teamId = (Integer) row[0];
            String teamName = (String) row[1];
            String teamCity = (String) row[2];
            String teamPhotoUrl = (String) row[3];
            Integer leaderId = (Integer) row[4];
            String leaderName = (String) row[5];
            String leaderEmail = (String) row[6];
            String leaderAvatarUrl = (String) row[7];
            long memberCount = ((Number) row[8]).longValue();

            ranking.add(new TeamRankingResponseDto(
                    teamId, teamName, teamCity, teamPhotoUrl,
                    leaderId, leaderName, leaderEmail, leaderAvatarUrl,
                    (int) memberCount, position++
            ));
        }

        return ranking;
    }

    public List<TeamRankingResponseDto> getLocalTeamRanking(String city, Integer limit) {
        List<Object[]> results = teamRepository.findTopTeamsByLocalMemberCount(city, limit);

        List<TeamRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer teamId = (Integer) row[0];
            String teamName = (String) row[1];
            String teamCity = (String) row[2];
            String teamPhotoUrl = (String) row[3];
            Integer leaderId = (Integer) row[4];
            String leaderName = (String) row[5];
            String leaderEmail = (String) row[6];
            String leaderAvatarUrl = (String) row[7];
            long memberCount = ((Number) row[8]).longValue();

            ranking.add(new TeamRankingResponseDto(
                    teamId, teamName, teamCity, teamPhotoUrl,
                    leaderId, leaderName, leaderEmail, leaderAvatarUrl,
                    (int) memberCount, position++
            ));
        }

        return ranking;
    }

    public List<String> getAvailableTeamCities() {
        return teamRepository.findDistinctCitiesFromTeams();
    }

    public List<EventRankingResponseDto> getRatingEventRanking(Integer limit, Integer minRatings) {
        List<Object[]> results = eventRepository.findTopEventsByRating(limit, minRatings);

        List<EventRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer eventId = (Integer) row[0];
            String eventName = (String) row[1];
            String eventImageUrl = (String) row[2];
            String eventCity = (String) row[3];
            String sportTypeName = (String) row[4];
            Integer ownerId = (Integer) row[5];
            String ownerName = (String) row[6];
            String ownerEmail = (String) row[7];
            String ownerAvatarUrl = (String) row[8];
            Double avgRating = ((Number) row[9]).doubleValue();
            long totalRatings = ((Number) row[10]).longValue();
            long participantCount = ((Number) row[11]).longValue();

            ranking.add(new EventRankingResponseDto(
                    eventId, eventName, eventImageUrl, eventCity, sportTypeName,
                    ownerId, ownerName, ownerEmail, ownerAvatarUrl,
                    avgRating, (int) totalRatings, (int) participantCount, position++
            ));
        }

        return ranking;
    }

    public List<EventRankingResponseDto> getPopularityEventRanking(Integer limit) {
        List<Object[]> results = eventRepository.findTopEventsByPopularity(limit);

        List<EventRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer eventId = (Integer) row[0];
            String eventName = (String) row[1];
            String eventImageUrl = (String) row[2];
            String eventCity = (String) row[3];
            String sportTypeName = (String) row[4];
            Integer ownerId = (Integer) row[5];
            String ownerName = (String) row[6];
            String ownerEmail = (String) row[7];
            String ownerAvatarUrl = (String) row[8];
            Double avgRating = ((Number) row[9]).doubleValue();
            long totalRatings = ((Number) row[10]).longValue();
            long participantCount = ((Number) row[11]).longValue();

            ranking.add(new EventRankingResponseDto(
                    eventId, eventName, eventImageUrl, eventCity, sportTypeName,
                    ownerId, ownerName, ownerEmail, ownerAvatarUrl,
                    avgRating, (int) totalRatings, (int) participantCount, position++
            ));
        }

        return ranking;
    }

    public List<EventRankingResponseDto> getLocalEventRanking(String city, Integer limit, Integer minRatings) {
        List<Object[]> results = eventRepository.findTopEventsByLocalRating(city, limit, minRatings);

        List<EventRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer eventId = (Integer) row[0];
            String eventName = (String) row[1];
            String eventImageUrl = (String) row[2];
            String eventCity = (String) row[3];
            String sportTypeName = (String) row[4];
            Integer ownerId = (Integer) row[5];
            String ownerName = (String) row[6];
            String ownerEmail = (String) row[7];
            String ownerAvatarUrl = (String) row[8];
            Double avgRating = ((Number) row[9]).doubleValue();
            long totalRatings = ((Number) row[10]).longValue();
            long participantCount = ((Number) row[11]).longValue();

            ranking.add(new EventRankingResponseDto(
                    eventId, eventName, eventImageUrl, eventCity, sportTypeName,
                    ownerId, ownerName, ownerEmail, ownerAvatarUrl,
                    avgRating, (int) totalRatings, (int) participantCount, position++
            ));
        }

        return ranking;
    }

    public List<BadgeRankingResponseDto> getGeneralBadgeRanking(Integer limit) {
        List<Object[]> results = userBadgeRepository.findTopUsersByBadgeCount(limit);

        List<BadgeRankingResponseDto> ranking = new ArrayList<>();
        int position = 1;

        for (Object[] row : results) {
            Integer userId = (Integer) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            long badgeCount = ((Number) row[4]).longValue();

            ranking.add(new BadgeRankingResponseDto(
                    userId, name, email, avatarUrl,
                    (int) badgeCount, position++
            ));
        }

        return ranking;
    }
}
