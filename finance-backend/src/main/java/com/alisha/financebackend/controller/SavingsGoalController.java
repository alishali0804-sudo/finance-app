package com.alisha.financebackend.controller;

import com.alisha.financebackend.model.SavingsGoal;
import com.alisha.financebackend.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(
            SavingsGoalService savingsGoalService
    ) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public List<SavingsGoal> getAllGoals() {
        return savingsGoalService.getAllGoals();
    }

    @GetMapping("/{id}")
    public SavingsGoal getGoalById(
            @PathVariable Long id
    ) {
        return savingsGoalService.getGoalById(id);
    }

    @PostMapping
    public SavingsGoal createGoal(
            @Valid @RequestBody SavingsGoal goal
    ) {
        return savingsGoalService.createGoal(goal);
    }

    @PutMapping("/{id}")
    public SavingsGoal updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoal goal
    ) {
        return savingsGoalService.updateGoal(
                id,
                goal
        );
    }

    @DeleteMapping("/{id}")
    public void deleteGoal(
            @PathVariable Long id
    ) {
        savingsGoalService.deleteGoal(id);
    }

    @GetMapping("/{id}/progress")
    public Map<String, Object> getGoalProgress(
            @PathVariable Long id
    ) {
        return savingsGoalService
                .getGoalProgress(id);
    }
}