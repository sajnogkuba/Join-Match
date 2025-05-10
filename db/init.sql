CREATE TABLE Event (
                       event_ID int  NOT NULL,
                       number_of_participants int  NOT NULL,
                       cost decimal(6,2)  NOT NULL,
                       owner_ID int  NOT NULL,
                       Sport_object_object_ID int  NOT NULL,
                       Event_Visibility_id int  NOT NULL,
                       status varchar(50)  NOT NULL,
                       score_team1 int  NOT NULL,
                       score_team2 int  NOT NULL,
                       CONSTRAINT Event_pk PRIMARY KEY (event_ID)
);

-- Table: Event_Visibility
CREATE TABLE Event_Visibility (
                                  id int  NOT NULL,
                                  name varchar(100)  NOT NULL,
                                  CONSTRAINT Event_Visibility_pk PRIMARY KEY (id)
);

-- Table: User
CREATE TABLE "User" (
                        user_ID int  NOT NULL,
                        name varchar(10)  NOT NULL,
                        email varchar(15)  NOT NULL,
                        password varchar(16)  NOT NULL,
                        salt varchar(10)  NOT NULL,
                        date_Of_Brith date  NOT NULL,
                        CONSTRAINT User_pk PRIMARY KEY (user_ID)
);

-- Table: Sport_object
CREATE TABLE Sport_object (
                              object_ID int  NOT NULL,
                              name varchar(20)  NOT NULL,
                              city varchar(20)  NOT NULL,
                              street varchar(20)  NOT NULL,
                              number int  NOT NULL,
                              second_number int  NULL,
                              capacity int  NOT NULL,
                              CONSTRAINT Sport_object_pk PRIMARY KEY (object_ID)
);

ALTER TABLE Event ADD CONSTRAINT Event_User
    FOREIGN KEY (owner_ID)
        REFERENCES "User" (user_ID)
        NOT DEFERRABLE
            INITIALLY IMMEDIATE
;

-- Reference: Event_Event_Visibility (table: Event)
ALTER TABLE Event ADD CONSTRAINT Event_Event_Visibility
    FOREIGN KEY (Event_Visibility_id)
        REFERENCES Event_Visibility (id)
        NOT DEFERRABLE
            INITIALLY IMMEDIATE
;

-- Reference: Event_Sport_object (table: Event)
ALTER TABLE Event ADD CONSTRAINT Event_Sport_object
    FOREIGN KEY (Sport_object_object_ID)
        REFERENCES Sport_object (object_ID)
        NOT DEFERRABLE
            INITIALLY IMMEDIATE
;


-- Dodanie użytkowników
INSERT INTO "User" (user_ID, name, email, password, salt, date_Of_Brith) VALUES
                                                                             (1, 'Anna', 'anna@example.com', 'pass1234', 'salt123', '1995-03-15'),
                                                                             (2, 'Tomek', 'tomek@example.com', 'pass5678', 'salt456', '1992-07-22');

-- Dodanie widoczności wydarzeń
INSERT INTO Event_Visibility (id, name) VALUES
                                            (1, 'Public'),
                                            (2, 'Private'),
                                            (3, 'Friends-only');

-- Dodanie obiektów sportowych
INSERT INTO Sport_object (object_ID, name, city, street, number, second_number, capacity) VALUES
                                                                                              (1, 'Arena A', 'Warsaw', 'Main St', 10, NULL, 200),
                                                                                              (2, 'Stadium B', 'Krakow', 'Stadium Rd', 5, 2, 500),
                                                                                              (3, 'Field C', 'Gdansk', 'Green Ave', 12, NULL, 100);

-- Dodanie przykładowych wydarzeń
INSERT INTO Event (event_ID, number_of_participants, cost, owner_ID, Sport_object_object_ID, Event_Visibility_id, status, score_team1, score_team2) VALUES
                                                                                                                                                        (1, 10, 50.00, 1, 1, 1, 'planned', 0, 0),
                                                                                                                                                        (2, 22, 0.00, 2, 2, 2, 'active', 2, 1),
                                                                                                                                                        (3, 8, 25.50, 1, 3, 3, 'finished', 5, 3);

