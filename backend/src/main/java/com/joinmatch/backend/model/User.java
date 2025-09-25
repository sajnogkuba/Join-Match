package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "\"join_match_user\"")
@NoArgsConstructor
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "email", nullable = false, length = 50, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 255)
    private Role role;


    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<JoinMatchToken> tokens = new ArrayList<>();

    @OneToMany(mappedBy = "user",cascade = CascadeType.REMOVE)
    private Set<SportUser> sportUsers = new HashSet<>();


    public List<JoinMatchToken> getTokens() {
        return Collections.unmodifiableList(tokens);
    }

    public void addToken(JoinMatchToken token) {
        tokens.add(token);
        token.setUser(this);
    }

    public void removeToken(JoinMatchToken token) {
        tokens.remove(token);
        token.setUser(null);
    }


}