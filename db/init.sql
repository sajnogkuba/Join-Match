CREATE TABLE join_match_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    role VARCHAR(255) NOT NULL
);
