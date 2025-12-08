package com.joinmatch.backend.dto.Moderator;

public record GetStatisticsForDashboard(long numberOfRecentReportsCompetitions,
                                        long numberOfRecentReportsEventRatings,
                                        long numberOfRecentReportsEvents,
                                        long numberOfRecentReportsTeams,
                                        long numberOfRecentReportsUserRating,
                                        long numberOfRecentReportsUser
)
{
}
