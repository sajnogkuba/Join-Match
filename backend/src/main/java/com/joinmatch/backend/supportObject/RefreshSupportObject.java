package com.joinmatch.backend.supportObject;

import com.joinmatch.backend.model.User;

import java.util.List;

public class RefreshSupportObject {
    private User user;
    private TokenSupportObject tokenSupportObject;

    public RefreshSupportObject(User user, TokenSupportObject tokenSupportObject) {
        this.user = user;
        this.tokenSupportObject = tokenSupportObject;
    }

    public User getUser() {
        return user;
    }


    public TokenSupportObject getTokenSupportObject() {
        return tokenSupportObject;
    }
}
