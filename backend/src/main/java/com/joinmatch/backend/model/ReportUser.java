package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User userId;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private Boolean active;
    @Column(name = "reviewed",nullable = false)
    private boolean reviewed;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reporterUserId;
}
