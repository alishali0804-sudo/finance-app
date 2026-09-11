package com.alisha.financebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "savings_goals")
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Goal name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Target amount must be greater than 0"
    )
    @Column(nullable = false)
    private BigDecimal targetAmount;

    @NotNull(message = "Current amount is required")
    @DecimalMin(
            value = "0.00",
            message = "Current amount cannot be negative"
    )
    @Column(nullable = false)
    private BigDecimal currentAmount;

    @NotNull(message = "Target date is required")
    @Column(nullable = false)
    private LocalDate targetDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private AppUser user;

    public SavingsGoal() {
    }

    public SavingsGoal(
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount,
            LocalDate targetDate
    ) {
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount;
        this.targetDate = targetDate;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public AppUser getUser() {
        return user;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }
}