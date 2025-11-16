package com.joinmatch.backend.controller;

import com.joinmatch.backend.service.TeamPostMentionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/team-post-mention")
@RequiredArgsConstructor
public class TeamPostMentionController {
    private final TeamPostMentionService teamPostMentionService;
}
