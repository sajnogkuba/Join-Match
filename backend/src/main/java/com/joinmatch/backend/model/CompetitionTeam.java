package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competition_team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetitionTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}