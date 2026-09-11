package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.repository.AppUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    public CurrentUserService(
            AppUserRepository appUserRepository
    ) {
        this.appUserRepository = appUserRepository;
    }

    public AppUser getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return appUserRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }
}