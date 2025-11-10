package com.joinmatch.backend.repository;

import com.joinmatch.backend.model.TeamPostMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamPostMentionRepository extends JpaRepository<TeamPostMention, Integer>, JpaSpecificationExecutor<TeamPostMention> {
}
