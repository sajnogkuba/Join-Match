CREATE TABLE join_match_user (
                                 id SERIAL PRIMARY KEY,
                                 name VARCHAR(30) NOT NULL,
                                 email VARCHAR(50) NOT NULL UNIQUE,
                                 password VARCHAR(100) NOT NULL,
                                 date_of_birth DATE NOT NULL,
                                 role VARCHAR(255) NOT NULL
);
CREATE TABLE joinmatch_token (
                                 id             BIGSERIAL PRIMARY KEY,
                                 token          TEXT NOT NULL,
                                 user_id        INTEGER NOT NULL
                                     REFERENCES join_match_user(id)
                                         ON DELETE CASCADE,
                                 expire_date    TIMESTAMP   NOT NULL,
                                 revoked        BOOLEAN     NOT NULL DEFAULT FALSE,
                                 refresh_token  TEXT
);
INSERT INTO join_match_user(name, email, password, date_of_birth, role) VALUES ('John Doe', 'john.doe@gmail.com', 'password123', '1990-01-01', 'user');
INSERT INTO join_match_user(name, email, password, date_of_birth, role) VALUES ('test user', 'test.user@gmail.com', 'password123', '2000-01-01', 'user');
INSERT INTO join_match_user(name, email, password, date_of_birth, role) VALUES ('Kuba Sajnóg', 'kuba.sajnog@gmail.com', 'password123', '2003-03-11', 'user');

create table public.event_visibility
(
    id   bigserial
        primary key,
    name varchar(100) not null
);

alter table public.event_visibility
    owner to joinuser;

INSERT INTO public.event_visibility (id, name) VALUES (1, 'public');
INSERT INTO public.event_visibility (id, name) VALUES (2, 'private');

create table public.sport_object
(
    object_id     bigserial
        primary key,
    name          varchar(50) not null,
    city          varchar(50) not null,
    street        varchar(50) not null,
    number        integer     not null,
    second_number integer,
    capacity      integer     not null
);

alter table public.sport_object
    owner to joinuser;


INSERT INTO public.sport_object (object_id, name, city, street, number, second_number, capacity) VALUES (1, 'Orlik 2012', 'Kraków', 'Osiedlowa', 12, null, 150);
INSERT INTO public.sport_object (object_id, name, city, street, number, second_number, capacity) VALUES (2, 'Hala Sportowa SP 8', 'Gdynia', 'Szkolna', 5, null, 300);
INSERT INTO public.sport_object (object_id, name, city, street, number, second_number, capacity) VALUES (3, 'Boisko "Zielona Polana"', 'Rzeszów', 'Leśna', 7, null, 80);
INSERT INTO public.sport_object (object_id, name, city, street, number, second_number, capacity) VALUES (4, 'Sala Gimnastyczna LO3', 'Opole', 'Kościuszki', 10, 1, 120);
INSERT INTO public.sport_object (object_id, name, city, street, number, second_number, capacity) VALUES (5, 'Boisko Osiedlowe', 'Zabrze', 'Sportowa', 3, null, 60);

CREATE TABLE public.sport_type
(
    id   bigserial
        primary key,
    name varchar(100) not null
);

INSERT INTO sport_type (id, name) VALUES (1, 'Football');
INSERT INTO sport_type (id, name) VALUES (2, 'Basketball');
INSERT INTO sport_type (id, name) VALUES (3, 'Volleyball');


create table public.event
(
    event_id               bigserial
        primary key,
    event_name             varchar(100)  not null,
    number_of_participants integer       not null,
    cost                   numeric(6, 2) not null,
    owner_id               integer       not null
        references public.join_match_user,
    sport_object_object_id integer       not null
        references public.sport_object,
    event_visibility_id    integer       not null
        references public.event_visibility,
    status                 varchar(50)   not null,
    score_team1            integer,
    score_team2            integer,
    sport_type_id          integer       not null
        references public.sport_type,
    event_date            timestamp     not null
);

alter table public.event
    owner to joinuser;


INSERT INTO public.event (event_id, event_name, number_of_participants, cost, owner_id, sport_object_object_id, event_visibility_id, status, score_team1, score_team2, sport_type_id, event_date) VALUES (1, 'Event1', 10, 20.00, 1, 1, 1, 'planned', null, null, 1, '2025-10-01 10:00:00');
INSERT INTO public.event (event_id, event_name, number_of_participants, cost, owner_id, sport_object_object_id, event_visibility_id, status, score_team1, score_team2, sport_type_id, event_date) VALUES (2, 'Event2', 5, 0.00, 2, 2, 1, 'planned', null, null, 2, '2025-10-02 11:00:00');
INSERT INTO public.event (event_id, event_name, number_of_participants, cost, owner_id, sport_object_object_id, event_visibility_id, status, score_team1, score_team2, sport_type_id, event_date) VALUES (3, 'Event3', 15, 15.00, 3, 3, 1, 'planned', null, null, 3, '2025-10-03 12:00:00');




