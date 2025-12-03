package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
}