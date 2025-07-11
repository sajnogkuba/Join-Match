package com.joinmatch.backend.model;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "\"JoinMatchUser\"")
@NoArgsConstructor
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


        public List<JoinMatchToken> getTokens() {
            return tokens;
        }

        public void addToken(JoinMatchToken token) {
            tokens.add(token);
            token.setUser(this);
        }

        public void removeToken(JoinMatchToken token) {
            tokens.remove(token);
            token.setUser(null);
        }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Role getRole() {
        return role;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }

    public String getUsername() {
        return email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBrith) {
        this.dateOfBirth = dateOfBrith;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}