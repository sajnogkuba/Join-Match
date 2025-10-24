package com.joinmatch.backend.dto;

import jakarta.persistence.criteria.CriteriaBuilder;

public record MainSportDto (
        String email,
        Integer idSport
){
}
