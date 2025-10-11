package com.joinmatch.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "sport")
public class Sport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    @Size(max = 100)
    @NotNull
    @Column(name = "URL", nullable = false, length = 100)
    private String URL;


    @OneToMany(mappedBy = "sport", cascade = CascadeType.REMOVE)
    private Set<SportUser> sportUsers;

    @OneToMany(mappedBy = "sportEv", cascade = CascadeType.REMOVE)
    private Set<Event> events = new HashSet<>();
}