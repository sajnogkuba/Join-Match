package com.joinmatch.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name= "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;

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

    @Column(name = "event_date", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventDate;

    @Column(name = "min_level", nullable = false)
    private Integer minLevel;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_type_id", nullable = false)
    private Sport sportEv;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserEvent> userEvents = new ArrayList<>();
}
