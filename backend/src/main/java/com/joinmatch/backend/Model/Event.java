package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name= "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "event_name", length = 100, nullable = false)
    private String eventName;

    @Column(name = "number_of_participants", nullable = false)
    private Integer numberOfParticipants;

    @Column(name = "cost", precision = 6, scale = 2, nullable = false)
    private BigDecimal cost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_object_object_id", nullable = false)
    private SportObject sportObject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_visibility_id", nullable = false)
    private EventVisibility eventVisibility;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "score_team1")
    private Integer scoreTeam1;

    @Column(name = "score_team2")
    private Integer scoreTeam2;
}
