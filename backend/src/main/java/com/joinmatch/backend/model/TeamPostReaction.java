package com.joinmatch.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "team_post_reaction",
        uniqueConstraints = {
                @UniqueConstraint(name = "unique_post_reaction", columnNames = {"user_id", "post_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamPostReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private TeamPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reaction_type_id", nullable = false)
    private ReactionType reactionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}