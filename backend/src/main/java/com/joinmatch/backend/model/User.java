package com.joinmatch.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joinmatch.backend.enums.Role;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
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

    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "url_of_picture", length = 255)
    private String urlOfPicture;
    @Column(name= "is_blocked", nullable = false)
    private Boolean isBlocked;

    @Column(name = "verification_code", length = 64)
    private String verificationCode;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;


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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<SportUser> sportUsers = new HashSet<>();


    @OneToMany(mappedBy = "rated", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserRating> receivedRatings = new ArrayList<>();

    @OneToMany(mappedBy = "rater", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserRating> givenRatings = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<EventRating> eventRatings = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserTeam> userTeams = new ArrayList<>();

    @OneToMany(mappedBy = "suspectUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportUser> suspectUser = new HashSet<>();

    @OneToMany(mappedBy = "reporterUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportUser> userReportSender = new HashSet<>();

    @OneToMany(mappedBy = "teamReporterUser",cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportTeam> teamReportSender = new HashSet<>();

    @OneToMany(mappedBy = "reporterUser",cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportEventRating> reportEventRatings = new HashSet<>();

    @OneToMany(mappedBy = "userRatingReporter", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportUserRating> reportUserRatings = new HashSet<>();

    @OneToMany(mappedBy = "reporterUser", cascade = CascadeType.ALL,orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportCompetition> reportCompetitions = new HashSet<>();

    @OneToMany(mappedBy = "reporterUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ReportEvent> reportEvents = new HashSet<>();
    public List<JoinMatchToken> getTokens() {
        return Collections.unmodifiableList(tokens);
    }

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserBadge> userBadges = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<UserEvent> userEvents = new HashSet<>();

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    private List<Event> createdEvents = new ArrayList<>();



    public void addToken(JoinMatchToken token) {
        tokens.add(token);
        token.setUser(this);
    }

    public Integer getSportLevel(Integer sportId) {
        return sportUsers.stream()
                .filter(su -> su.getSport().getId().equals(sportId))
                .map(SportUser::getRating)
                .findFirst()
                .orElse(null);
    }



}