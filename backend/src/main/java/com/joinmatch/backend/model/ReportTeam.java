package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "report_team")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Boolean active;
    @Column(name = "reviewed",nullable = false)
    private boolean reviewed;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team teamId;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User teamReporterUserId;
}
