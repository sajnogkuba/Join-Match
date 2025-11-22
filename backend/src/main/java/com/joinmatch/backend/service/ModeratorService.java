package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.Moderator.GetStatisticsForDashboard;
import com.joinmatch.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModeratorService {
    private final ReportCompetitionRepository reportCompetitionRepository;
    private final ReportEventRatingRepository reportEventRatingRepository;
    private final ReportEventRepository reportEventRepository;
    private final ReportTeamRepository reportTeamRepository;
    private final ReportUserRatingRepository reportUserRatingRepository;
    private final ReportUserRepository reportUserRepository;

    public GetStatisticsForDashboard getStatisticsForDashboard(){
        long newReportsForCompetition = reportCompetitionRepository.countByReviewedIsFalse();
        long newReportsForEventRating = reportEventRatingRepository.countByReviewedIsFalse();
        long newReportsForEvent = reportEventRepository.countByReviewedIsFalse();
        long newReportsForTeam = reportTeamRepository.countByReviewedIsFalse();
        long newReportsForUserRating = reportUserRatingRepository.countByReviewedIsFalse();
        long newReportsForUser = reportUserRepository.countByReviewedIsFalse();
        return new GetStatisticsForDashboard(newReportsForCompetition,newReportsForEventRating,newReportsForEvent,newReportsForTeam,newReportsForUserRating,newReportsForUser);
    }
}
