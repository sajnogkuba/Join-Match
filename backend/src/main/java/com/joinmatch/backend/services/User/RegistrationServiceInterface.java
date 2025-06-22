package com.joinmatch.backend.services.User;

import com.joinmatch.backend.model.User;

import java.time.LocalDate;

public interface RegistrationServiceInterface {
    public User register(String email, String rawPassword,String name, LocalDate birthdate);
}
