package com.joinmatch.backend.repository;


import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.TeamRequest;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamRequestRepository extends JpaRepository<TeamRequest, Integer>, JpaSpecificationExecutor<TeamRequest> {
    Page<TeamRequest> findAllByTeam(Team team, Pageable sortedPageable);

    Page<TeamRequest> findAllByReceiver(User receiver, Pageable pageable);
}
