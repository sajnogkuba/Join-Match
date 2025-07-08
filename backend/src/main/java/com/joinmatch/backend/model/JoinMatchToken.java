package com.joinmatch.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "joinmatch_token")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class JoinMatchToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
}
