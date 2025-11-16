package com.joinmatch.backend.service;

import com.joinmatch.backend.repository.TeamPostMentionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TeamPostMentionService {
    private final TeamPostMentionRepository teamPostMentionRepository;
}
