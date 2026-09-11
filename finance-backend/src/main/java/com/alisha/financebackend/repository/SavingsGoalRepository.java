package com.alisha.financebackend.repository;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavingsGoalRepository
        extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findByUserOrderByTargetDateAsc(
            AppUser user
    );

    Optional<SavingsGoal> findByIdAndUser(
            Long id,
            AppUser user
    );
}