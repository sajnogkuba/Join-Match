package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "report_user_rating")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportUserRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "rate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserRating userRating;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User userRatingReported;

    @Column(nullable = false)
    private Boolean reviewed;
}