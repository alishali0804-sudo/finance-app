package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.SavingsGoal;
import com.alisha.financebackend.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository
            savingsGoalRepository;

    private final CurrentUserService
            currentUserService;

    public SavingsGoalService(
            SavingsGoalRepository savingsGoalRepository,
            CurrentUserService currentUserService
    ) {
        this.savingsGoalRepository =
                savingsGoalRepository;

        this.currentUserService =
                currentUserService;
    }

    public List<SavingsGoal> getAllGoals() {

        AppUser user =
                currentUserService.getCurrentUser();

        return savingsGoalRepository
                .findByUserOrderByTargetDateAsc(
                        user
                );
    }

    public SavingsGoal getGoalById(
            Long id
    ) {

        AppUser user =
                currentUserService.getCurrentUser();

        return savingsGoalRepository
                .findByIdAndUser(
                        id,
                        user
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Savings goal not found"
                        )
                );
    }

    public SavingsGoal createGoal(
            SavingsGoal goal
    ) {

        AppUser user =
                currentUserService.getCurrentUser();

        goal.setUser(user);

        return savingsGoalRepository
                .save(goal);
    }

    public SavingsGoal updateGoal(
            Long id,
            SavingsGoal updatedGoal
    ) {

        AppUser user =
                currentUserService.getCurrentUser();

        SavingsGoal existingGoal =
                savingsGoalRepository
                        .findByIdAndUser(
                                id,
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Savings goal not found"
                                        )
                        );

        existingGoal.setName(
                updatedGoal.getName()
        );

        existingGoal.setTargetAmount(
                updatedGoal.getTargetAmount()
        );

        existingGoal.setCurrentAmount(
                updatedGoal.getCurrentAmount()
        );

        existingGoal.setTargetDate(
                updatedGoal.getTargetDate()
        );

        return savingsGoalRepository.save(
                existingGoal
        );
    }

    public void deleteGoal(
            Long id
    ) {

        AppUser user =
                currentUserService.getCurrentUser();

        SavingsGoal goal =
                savingsGoalRepository
                        .findByIdAndUser(
                                id,
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Savings goal not found"
                                        )
                        );

        savingsGoalRepository.delete(goal);
    }

    public Map<String, Object> getGoalProgress(
            Long id
    ) {

        SavingsGoal goal =
                getGoalById(id);

        BigDecimal remainingAmount =
                goal.getTargetAmount()
                        .subtract(
                                goal.getCurrentAmount()
                        );

        if (
                remainingAmount.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            remainingAmount =
                    BigDecimal.ZERO;
        }

        BigDecimal progressPercent;

        if (
                goal.getTargetAmount()
                        .compareTo(
                                BigDecimal.ZERO
                        ) == 0
        ) {
            progressPercent =
                    BigDecimal.ZERO;
        } else {

            progressPercent =
                    goal.getCurrentAmount()
                            .divide(
                                    goal.getTargetAmount(),
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    new BigDecimal("100")
                            );

            if (
                    progressPercent.compareTo(
                            new BigDecimal("100")
                    ) > 0
            ) {
                progressPercent =
                        new BigDecimal("100");
            }
        }

        progressPercent =
                progressPercent.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        Map<String, Object> progress =
                new LinkedHashMap<>();

        progress.put(
                "goalId",
                goal.getId()
        );

        progress.put(
                "name",
                goal.getName()
        );

        progress.put(
                "targetAmount",
                goal.getTargetAmount()
        );

        progress.put(
                "currentAmount",
                goal.getCurrentAmount()
        );

        progress.put(
                "remainingAmount",
                remainingAmount
        );

        progress.put(
                "progressPercent",
                progressPercent
        );

        progress.put(
                "targetDate",
                goal.getTargetDate()
        );

        return progress;
    }
}