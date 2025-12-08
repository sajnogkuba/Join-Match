package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_competition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCompetition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporterUser;

    @Column(nullable = false)
    private Boolean reviewed;
}
