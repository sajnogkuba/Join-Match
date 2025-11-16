package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sport_object")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SportObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer objectId;

    private String name;

    private String city;

    private String street;

    private Integer number;

    private Integer secondNumber;


    private Double latitude;

    private Double longitude;

    @OneToMany(mappedBy = "sportObject", orphanRemoval = true, cascade = CascadeType.ALL)
    private Set<Competition> competitionSet = new HashSet<>();
}
