package com.alisha.financebackend.service;

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

    private final SavingsGoalRepository savingsGoalRepository;

    public SavingsGoalService(
            SavingsGoalRepository savingsGoalRepository
    ) {
        this.savingsGoalRepository = savingsGoalRepository;
    }

    public List<SavingsGoal> getAllGoals() {
        return savingsGoalRepository.findAll();
    }

    public SavingsGoal getGoalById(Long id) {
        return savingsGoalRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Savings goal not found")
                );
    }

    public SavingsGoal createGoal(SavingsGoal goal) {
        return savingsGoalRepository.save(goal);
    }

    public SavingsGoal updateGoal(
            Long id,
            SavingsGoal updatedGoal
    ) {

        SavingsGoal existingGoal = getGoalById(id);

        existingGoal.setName(updatedGoal.getName());
        existingGoal.setTargetAmount(
                updatedGoal.getTargetAmount()
        );
        existingGoal.setCurrentAmount(
                updatedGoal.getCurrentAmount()
        );
        existingGoal.setTargetDate(
                updatedGoal.getTargetDate()
        );

        return savingsGoalRepository.save(existingGoal);
    }

    public void deleteGoal(Long id) {

        if (!savingsGoalRepository.existsById(id)) {
            throw new RuntimeException(
                    "Savings goal not found"
            );
        }

        savingsGoalRepository.deleteById(id);
    }

    public Map<String, Object> getGoalProgress(Long id) {

        SavingsGoal goal = getGoalById(id);

        BigDecimal remainingAmount =
                goal.getTargetAmount()
                        .subtract(goal.getCurrentAmount());

        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        BigDecimal progressPercent =
                BigDecimal.ZERO;

        if (goal.getTargetAmount()
                .compareTo(BigDecimal.ZERO) > 0) {

            progressPercent =
                    goal.getCurrentAmount()
                            .divide(
                                    goal.getTargetAmount(),
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        if (progressPercent.compareTo(
                BigDecimal.valueOf(100)
        ) > 0) {
            progressPercent =
                    BigDecimal.valueOf(100);
        }

        Map<String, Object> progress =
                new LinkedHashMap<>();

        progress.put("goalName", goal.getName());
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