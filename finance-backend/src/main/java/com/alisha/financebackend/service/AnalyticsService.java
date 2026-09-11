package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.Transaction;
import com.alisha.financebackend.model.TransactionType;
import com.alisha.financebackend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public AnalyticsService(
            TransactionRepository transactionRepository,
            CurrentUserService currentUserService
    ) {
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    private List<Transaction> getCurrentUserTransactions() {

        AppUser user =
                currentUserService.getCurrentUser();

        return transactionRepository
                .findByUserOrderByDateDesc(user);
    }

    public Map<String, BigDecimal> getSummary() {

        List<Transaction> transactions =
                getCurrentUserTransactions();

        BigDecimal totalIncome =
                BigDecimal.ZERO;

        BigDecimal totalExpenses =
                BigDecimal.ZERO;

        for (Transaction transaction : transactions) {

            if (
                    transaction.getType()
                            == TransactionType.INCOME
            ) {
                totalIncome =
                        totalIncome.add(
                                transaction.getAmount()
                        );
            }

            if (
                    transaction.getType()
                            == TransactionType.EXPENSE
            ) {
                totalExpenses =
                        totalExpenses.add(
                                transaction.getAmount()
                        );
            }
        }

        BigDecimal netCashFlow =
                totalIncome.subtract(
                        totalExpenses
                );

        Map<String, BigDecimal> summary =
                new LinkedHashMap<>();

        summary.put(
                "totalIncome",
                totalIncome
        );

        summary.put(
                "totalExpenses",
                totalExpenses
        );

        summary.put(
                "netCashFlow",
                netCashFlow
        );

        return summary;
    }

    public Map<String, BigDecimal>
    getSpendingByCategory() {

        List<Transaction> transactions =
                getCurrentUserTransactions();

        Map<String, BigDecimal> categoryTotals =
                new LinkedHashMap<>();

        for (Transaction transaction : transactions) {

            if (
                    transaction.getType()
                            != TransactionType.EXPENSE
            ) {
                continue;
            }

            String category =
                    transaction.getCategory();

            BigDecimal currentTotal =
                    categoryTotals.getOrDefault(
                            category,
                            BigDecimal.ZERO
                    );

            categoryTotals.put(
                    category,
                    currentTotal.add(
                            transaction.getAmount()
                    )
            );
        }

        return categoryTotals;
    }

    public Map<String, BigDecimal>
    getMonthlySpending() {

        List<Transaction> transactions =
                getCurrentUserTransactions();

        Map<String, BigDecimal> monthlyTotals =
                new LinkedHashMap<>();

        transactions.stream()
                .filter(
                        transaction ->
                                transaction.getType()
                                        == TransactionType.EXPENSE
                )
                .sorted(
                        (first, second) ->
                                first.getDate()
                                        .compareTo(
                                                second.getDate()
                                        )
                )
                .forEach(transaction -> {

                    String month =
                            YearMonth.from(
                                    transaction.getDate()
                            ).toString();

                    BigDecimal currentTotal =
                            monthlyTotals.getOrDefault(
                                    month,
                                    BigDecimal.ZERO
                            );

                    monthlyTotals.put(
                            month,
                            currentTotal.add(
                                    transaction.getAmount()
                            )
                    );
                });

        return monthlyTotals;
    }

    public Map<String, Object>
    getMonthlyComparison() {

        Map<String, BigDecimal> monthlySpending =
                getMonthlySpending();

        Map<String, Object> result =
                new LinkedHashMap<>();

        if (monthlySpending.isEmpty()) {

            result.put(
                    "currentMonth",
                    null
            );

            result.put(
                    "currentMonthSpending",
                    BigDecimal.ZERO
            );

            result.put(
                    "previousMonth",
                    null
            );

            result.put(
                    "previousMonthSpending",
                    BigDecimal.ZERO
            );

            result.put(
                    "difference",
                    BigDecimal.ZERO
            );

            result.put(
                    "percentageChange",
                    BigDecimal.ZERO
            );

            return result;
        }

        List<String> months =
                new ArrayList<>(
                        monthlySpending.keySet()
                );

        String currentMonth =
                months.get(
                        months.size() - 1
                );

        BigDecimal currentSpending =
                monthlySpending.get(
                        currentMonth
                );

        String previousMonth = null;

        BigDecimal previousSpending =
                BigDecimal.ZERO;

        if (months.size() >= 2) {

            previousMonth =
                    months.get(
                            months.size() - 2
                    );

            previousSpending =
                    monthlySpending.get(
                            previousMonth
                    );
        }

        BigDecimal difference =
                currentSpending.subtract(
                        previousSpending
                );

        BigDecimal percentageChange =
                BigDecimal.ZERO;

        if (
                previousSpending.compareTo(
                        BigDecimal.ZERO
                ) != 0
        ) {

            percentageChange =
                    difference
                            .divide(
                                    previousSpending,
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    new BigDecimal("100")
                            )
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        result.put(
                "currentMonth",
                currentMonth
        );

        result.put(
                "currentMonthSpending",
                currentSpending
        );

        result.put(
                "previousMonth",
                previousMonth
        );

        result.put(
                "previousMonthSpending",
                previousSpending
        );

        result.put(
                "difference",
                difference
        );

        result.put(
                "percentageChange",
                percentageChange
        );

        return result;
    }

    public Map<String, Object>
    getCategoryComparison() {

        List<Transaction> transactions =
                getCurrentUserTransactions();

        Map<String, Object> result =
                new LinkedHashMap<>();

        List<Transaction> expenses =
                transactions.stream()
                        .filter(
                                transaction ->
                                        transaction.getType()
                                                == TransactionType.EXPENSE
                        )
                        .toList();

        if (expenses.isEmpty()) {

            result.put(
                    "currentMonth",
                    null
            );

            result.put(
                    "previousMonth",
                    null
            );

            result.put(
                    "currentMonthCategories",
                    new LinkedHashMap<
                            String,
                            BigDecimal
                            >()
            );

            result.put(
                    "previousMonthCategories",
                    new LinkedHashMap<
                            String,
                            BigDecimal
                            >()
            );

            return result;
        }

        YearMonth latestMonth =
                expenses.stream()
                        .map(
                                transaction ->
                                        YearMonth.from(
                                                transaction.getDate()
                                        )
                        )
                        .max(
                                YearMonth::compareTo
                        )
                        .orElseThrow();

        YearMonth previousMonth =
                latestMonth.minusMonths(1);

        Map<String, BigDecimal>
                currentCategories =
                new LinkedHashMap<>();

        Map<String, BigDecimal>
                previousCategories =
                new LinkedHashMap<>();

        for (Transaction transaction : expenses) {

            YearMonth transactionMonth =
                    YearMonth.from(
                            transaction.getDate()
                    );

            if (
                    transactionMonth.equals(
                            latestMonth
                    )
            ) {

                addToCategory(
                        currentCategories,
                        transaction
                );
            }

            if (
                    transactionMonth.equals(
                            previousMonth
                    )
            ) {

                addToCategory(
                        previousCategories,
                        transaction
                );
            }
        }

        result.put(
                "currentMonth",
                latestMonth.toString()
        );

        result.put(
                "previousMonth",
                previousMonth.toString()
        );

        result.put(
                "currentMonthCategories",
                currentCategories
        );

        result.put(
                "previousMonthCategories",
                previousCategories
        );

        return result;
    }

    private void addToCategory(
            Map<String, BigDecimal> totals,
            Transaction transaction
    ) {

        String category =
                transaction.getCategory();

        BigDecimal currentAmount =
                totals.getOrDefault(
                        category,
                        BigDecimal.ZERO
                );

        totals.put(
                category,
                currentAmount.add(
                        transaction.getAmount()
                )
        );
    }

    public List<Map<String, Object>>
    getUnusualSpending() {

        List<Transaction> transactions =
                getCurrentUserTransactions();

        List<Transaction> expenses =
                transactions.stream()
                        .filter(
                                transaction ->
                                        transaction.getType()
                                                == TransactionType.EXPENSE
                        )
                        .toList();

        List<Map<String, Object>>
                unusualTransactions =
                new ArrayList<>();

        if (expenses.isEmpty()) {
            return unusualTransactions;
        }

        BigDecimal totalExpenses =
                expenses.stream()
                        .map(
                                Transaction::getAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal averageExpense =
                totalExpenses.divide(
                        BigDecimal.valueOf(
                                expenses.size()
                        ),
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal unusualThreshold =
                averageExpense.multiply(
                        new BigDecimal("2")
                );

        for (Transaction transaction : expenses) {

            if (
                    transaction.getAmount()
                            .compareTo(
                                    unusualThreshold
                            ) > 0
            ) {

                Map<String, Object> item =
                        new LinkedHashMap<>();

                item.put(
                        "id",
                        transaction.getId()
                );

                item.put(
                        "description",
                        transaction.getDescription()
                );

                item.put(
                        "amount",
                        transaction.getAmount()
                );

                item.put(
                        "date",
                        transaction.getDate()
                );

                item.put(
                        "category",
                        transaction.getCategory()
                );

                item.put(
                        "averageExpense",
                        averageExpense
                );

                unusualTransactions.add(
                        item
                );
            }
        }

        return unusualTransactions;
    }
}