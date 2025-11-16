package com.joinmatch.backend.dto.Sport;

import jakarta.persistence.criteria.CriteriaBuilder;

public record MainSportDto (
        String email,
        Integer idSport
){
}
