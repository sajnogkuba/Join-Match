package com.joinmatch.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "team_post_comment_reaction",
        uniqueConstraints = {
                @UniqueConstraint(name = "unique_comment_reaction", columnNames = {"user_id", "comment_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamPostCommentReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private TeamPostComment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reaction_type_id", nullable = false)
    private ReactionType reactionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
