package com.joinmatch.backend.supportObject;

import com.joinmatch.backend.Model.User;

import java.util.List;

public class RefreshSupportObject {
    private User user;
    private List<String> tokens;

    public RefreshSupportObject(User user, List<String> tokens) {
        this.user = user;
        this.tokens = tokens;
    }

    public User getUser() {
        return user;
    }

    public List<String> getTokens() {
        return tokens;
    }

}
