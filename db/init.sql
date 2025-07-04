CREATE TABLE JoinMatchUser (
                               user_ID int  NOT NULL,
                               name varchar(30)  NOT NULL,
                               email varchar(50)  NOT NULL,
                               password varchar(100)  NOT NULL,
                               salt varchar(20)  NOT NULL,
                               date_Of_Birth date  NOT NULL,
                               CONSTRAINT JoinMatchUser_pk PRIMARY KEY (user_ID)
);
-- Table: Token
CREATE TABLE Token (
                       ID int  NOT NULL,
                       Token varchar(50)  NOT NULL,
                       UserID int  NOT NULL,
                       ExpireDate timestamp  NOT NULL,
                       Revoked boolean  NOT NULL,
                       RefreshToken varchar(50)  NOT NULL,
                       CONSTRAINT Token_pk PRIMARY KEY (ID)
);
-- Reference: Token_User (table: Token)
ALTER TABLE Token ADD CONSTRAINT Token_User
    FOREIGN KEY (UserID)
        REFERENCES JoinMatchUser (user_ID)
        NOT DEFERRABLE
            INITIALLY IMMEDIATE
;