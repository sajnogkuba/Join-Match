package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_event_rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEventRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "event_rating_id", nullable = false)
    private EventRating eventRating;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporterUser;

    @Column(nullable = false)
    private Boolean reviewed;
}
