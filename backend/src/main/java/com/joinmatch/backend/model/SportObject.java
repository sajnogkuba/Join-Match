package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
