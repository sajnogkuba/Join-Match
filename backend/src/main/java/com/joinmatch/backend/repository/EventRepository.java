package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {
    @Query("""
        select distinct e
        from Event e
        join JoinMatchToken t
          on t.user = e.owner
        where t.token = :token
          and (t.revoked = false or t.revoked is null)
          and (t.expireDate is null or t.expireDate > current timestamp)
    """)
    List<Event> findAllOwnedByUserToken(@Param("token") String token);
}