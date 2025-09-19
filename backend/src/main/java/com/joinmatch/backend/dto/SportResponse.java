package com.joinmatch.backend.dto;

import com.joinmatch.backend.model.SportUser;

import java.util.List;



public record SportResponse(List<SportWithRatingDto> sports) {}

