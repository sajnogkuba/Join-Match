package com.joinmatch.backend.Model;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "joinmatch_token")
public class JoinMatchToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false,columnDefinition = "TEXT")
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_token_user")
    )
    private User user;

    @Column(name = "expire_date", nullable = false)
    private LocalDateTime expireDate;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked = Boolean.FALSE;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    public JoinMatchToken() {}

    public JoinMatchToken(String token,
                          User user,
                          LocalDateTime expireDate,
                          Boolean revoked,
                          String refreshToken) {
        this.token = token;
        this.user = user;
        this.expireDate = expireDate;
        this.revoked = revoked;
        this.refreshToken = refreshToken;
    }

    // --- getters & setters ---

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(LocalDateTime expireDate) {
        this.expireDate = expireDate;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
