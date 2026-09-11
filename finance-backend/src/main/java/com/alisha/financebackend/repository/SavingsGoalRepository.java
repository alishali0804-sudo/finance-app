package com.alisha.financebackend.repository;

import com.alisha.financebackend.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavingsGoalRepository
        extends JpaRepository<SavingsGoal, Long> {
}