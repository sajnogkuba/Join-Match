package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100)
    private String description;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event reportedEvent;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "reporter_user_id", nullable = false)
    private Integer reporterUserId;

    @Column(nullable = false)
    private Boolean reviewed;
}
