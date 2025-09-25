package com.joinmatch.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sport_user")
public class SportUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer ID;
    @JoinColumn(name = "joinmatchuser_user_id", nullable = false)
    @ManyToOne
    private User user;
    @NotNull
    @JoinColumn(name = "sport_id", nullable = false)
    @ManyToOne
    private Sport sport;

    @NotNull
    @Column(name = "rating", nullable = false)
    private Integer rating;

}