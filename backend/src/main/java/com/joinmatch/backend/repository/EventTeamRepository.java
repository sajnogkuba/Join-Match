package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.EventTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventTeamRepository extends JpaRepository<EventTeam, Integer> {

    boolean existsByEvent_EventIdAndTeam_Id(Integer eventId, Integer teamId);

    List<EventTeam> findAllByEvent_EventId(Integer eventId);

    List<EventTeam> findAllByTeam_Id(Integer teamId);

    void deleteByEvent_EventIdAndTeam_Id(Integer eventId, Integer teamId);
    Optional<EventTeam> findByEvent_EventIdAndTeam_Id(Integer eventId, Integer teamId);

}


