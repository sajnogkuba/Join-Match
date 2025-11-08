package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Team;
import com.joinmatch.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamRepository extends JpaRepository<Team, Integer>, JpaSpecificationExecutor<Team> {
    boolean existsByName(String name);

    @Query("""
    SELECT t FROM Team t
    ORDER BY 
      CASE WHEN :sortBy = 'city' THEN LOWER(t.city)
           WHEN :sortBy = 'name' THEN LOWER(t.name)
           ELSE LOWER(t.name)
      END
      ASC
""")
    Page<Team> findAllCaseInsensitive(Pageable pageable, @Param("sortBy") String sortBy);

    @Query("""
    SELECT t FROM Team t
    WHERE t.leader = :leader
    ORDER BY 
      CASE WHEN :sortBy = 'city' THEN LOWER(t.city)
           WHEN :sortBy = 'name' THEN LOWER(t.name)
           ELSE LOWER(t.name)
      END
      ASC
""")
    Page<Team> findByLeader(User leader, Pageable sortedPageable);
}
