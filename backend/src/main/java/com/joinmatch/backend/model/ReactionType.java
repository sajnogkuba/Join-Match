package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reaction_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Cacheable
public class ReactionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false, unique = true, length = 30)
    private String name;

    @Column(name = "emoji", nullable = false, length = 10)
    private String emoji;

    @Column(name = "description", length = 100)
    private String description;
}