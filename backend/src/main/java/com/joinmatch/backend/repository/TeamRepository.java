package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Integer>, JpaSpecificationExecutor<Team> {
    boolean existsByName(String name);

    Page<Team> findAllByLeader(User leader, Pageable pageable);

    Page<Team> findAllByUserTeams_UserAndLeaderIsNot(User userTeamsUser, User leader, Pageable pageable);

    @Query("""
        SELECT t.id, t.name, t.city, t.photoUrl,
               t.leader.id, t.leader.name, t.leader.email, t.leader.urlOfPicture,
               COUNT(ut.id) as memberCount
        FROM Team t
        LEFT JOIN UserTeam ut ON ut.team.id = t.id
        WHERE NOT EXISTS (
            SELECT 1 FROM ReportTeam rt 
            WHERE rt.team.id = t.id AND rt.active = true
        )
        GROUP BY t.id, t.name, t.city, t.photoUrl, t.leader.id, t.leader.name, t.leader.email, t.leader.urlOfPicture
        HAVING COUNT(ut.id) > 0
        ORDER BY memberCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopTeamsByMemberCount(@Param("limit") Integer limit);

    @Query("""
        SELECT t.id, t.name, t.city, t.photoUrl,
               t.leader.id, t.leader.name, t.leader.email, t.leader.urlOfPicture,
               COUNT(ut.id) as memberCount
        FROM Team t
        LEFT JOIN UserTeam ut ON ut.team.id = t.id
        WHERE NOT EXISTS (
            SELECT 1 FROM ReportTeam rt 
            WHERE rt.team.id = t.id AND rt.active = true
        )
          AND LOWER(t.city) = LOWER(:city)
          AND t.city IS NOT NULL
        GROUP BY t.id, t.name, t.city, t.photoUrl, t.leader.id, t.leader.name, t.leader.email, t.leader.urlOfPicture
        HAVING COUNT(ut.id) > 0
        ORDER BY memberCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopTeamsByLocalMemberCount(@Param("city") String city, @Param("limit") Integer limit);

    @Query("""
        SELECT DISTINCT t.city
        FROM Team t
        WHERE t.city IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM ReportTeam rt 
              WHERE rt.team.id = t.id AND rt.active = true
          )
        ORDER BY t.city
    """)
    List<String> findDistinctCitiesFromTeams();
}
