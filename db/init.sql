CREATE TABLE join_match_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    role VARCHAR(255) NOT NULL
);
CREATE TABLE joinmatch_token (
                                 id             SERIAL PRIMARY KEY,
                                 token          TEXT NOT NULL,
                                 user_id        INTEGER NOT NULL
                                     REFERENCES join_match_user(id)
                                         ON DELETE CASCADE,
                                 expire_date    TIMESTAMP   NOT NULL,
                                 revoked        BOOLEAN     NOT NULL DEFAULT FALSE,
                                 refresh_token  TEXT
);


