package com.joinmatch.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "badges")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private String conditionType;
    private Integer conditionValue;
    private Boolean active;
    private String category;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "badge", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserBadge> userBadges = new ArrayList<>();
}