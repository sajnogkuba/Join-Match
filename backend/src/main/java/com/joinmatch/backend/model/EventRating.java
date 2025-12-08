package com.joinmatch.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "event_rating")
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class EventRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eventRatingId;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Min(1)
    @Max(5)
    private int rating;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "eventRating", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReportEventRating> reportEventRatings = new HashSet<>();
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}