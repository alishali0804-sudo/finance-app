package com.alisha.financebackend.service;

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
import java.util.TreeMap;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Map<String, BigDecimal> getSummary() {

        List<Transaction> transactions = transactionRepository.findAll();

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {

            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(transaction.getAmount());
            }

            if (transaction.getType() == TransactionType.EXPENSE) {
                totalExpenses = totalExpenses.add(transaction.getAmount());
            }
        }

        BigDecimal netCashFlow =
                totalIncome.subtract(totalExpenses);

        Map<String, BigDecimal> summary = new LinkedHashMap<>();

        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("netCashFlow", netCashFlow);

        return summary;
    }

    public Map<String, BigDecimal> getSpendingByCategory() {

        List<Transaction> transactions = transactionRepository.findAll();

        Map<String, BigDecimal> categoryTotals = new TreeMap<>();

        for (Transaction transaction : transactions) {

            if (transaction.getType() != TransactionType.EXPENSE) {
                continue;
            }

            String category = transaction.getCategory();

            categoryTotals.put(
                    category,
                    categoryTotals.getOrDefault(
                            category,
                            BigDecimal.ZERO
                    ).add(transaction.getAmount())
            );
        }

        return categoryTotals;
    }

    public Map<String, BigDecimal> getMonthlySpending() {

        List<Transaction> transactions = transactionRepository.findAll();

        Map<String, BigDecimal> monthlyTotals = new TreeMap<>();

        for (Transaction transaction : transactions) {

            if (transaction.getType() != TransactionType.EXPENSE) {
                continue;
            }

            YearMonth yearMonth =
                    YearMonth.from(transaction.getDate());

            String month = yearMonth.toString();

            monthlyTotals.put(
                    month,
                    monthlyTotals.getOrDefault(
                            month,
                            BigDecimal.ZERO
                    ).add(transaction.getAmount())
            );
        }

        return monthlyTotals;
    }

    public Map<String, Object> getMonthlyComparison() {

        Map<String, BigDecimal> monthlySpending =
                getMonthlySpending();

        Map<String, Object> result =
                new LinkedHashMap<>();

        if (monthlySpending.size() < 2) {
            result.put(
                    "message",
                    "Not enough monthly data to compare."
            );
            return result;
        }

        List<String> months = monthlySpending
                .keySet()
                .stream()
                .sorted()
                .toList();

        String currentMonth =
                months.get(months.size() - 1);

        String previousMonth =
                months.get(months.size() - 2);

        BigDecimal currentSpending =
                monthlySpending.get(currentMonth);

        BigDecimal previousSpending =
                monthlySpending.get(previousMonth);

        BigDecimal changeAmount =
                currentSpending.subtract(previousSpending);

        BigDecimal changePercent =
                BigDecimal.ZERO;

        if (previousSpending.compareTo(BigDecimal.ZERO) != 0) {
            changePercent = changeAmount
                    .divide(
                            previousSpending,
                            4,
                            RoundingMode.HALF_UP
                    )
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        result.put("currentMonth", currentMonth);
        result.put("previousMonth", previousMonth);
        result.put("currentSpending", currentSpending);
        result.put("previousSpending", previousSpending);
        result.put("changeAmount", changeAmount);
        result.put("changePercent", changePercent);

        return result;
    }

    public Map<String, Map<String, BigDecimal>>
    getCategoryComparison() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        Map<String, Map<String, BigDecimal>> result =
                new LinkedHashMap<>();

        List<YearMonth> months = transactions
                .stream()
                .filter(transaction ->
                        transaction.getType()
                                == TransactionType.EXPENSE)
                .map(transaction ->
                        YearMonth.from(transaction.getDate()))
                .distinct()
                .sorted()
                .toList();

        if (months.size() < 2) {
            return result;
        }

        YearMonth currentMonth =
                months.get(months.size() - 1);

        YearMonth previousMonth =
                months.get(months.size() - 2);

        Map<String, BigDecimal> currentCategories =
                new TreeMap<>();

        Map<String, BigDecimal> previousCategories =
                new TreeMap<>();

        for (Transaction transaction : transactions) {

            if (transaction.getType()
                    != TransactionType.EXPENSE) {
                continue;
            }

            YearMonth transactionMonth =
                    YearMonth.from(transaction.getDate());

            if (transactionMonth.equals(currentMonth)) {

                String category =
                        transaction.getCategory();

                currentCategories.put(
                        category,
                        currentCategories.getOrDefault(
                                category,
                                BigDecimal.ZERO
                        ).add(transaction.getAmount())
                );
            }

            if (transactionMonth.equals(previousMonth)) {

                String category =
                        transaction.getCategory();

                previousCategories.put(
                        category,
                        previousCategories.getOrDefault(
                                category,
                                BigDecimal.ZERO
                        ).add(transaction.getAmount())
                );
            }
        }

        result.put(
                currentMonth.toString(),
                currentCategories
        );

        result.put(
                previousMonth.toString(),
                previousCategories
        );

        return result;
    }

    public List<Map<String, Object>>
    getUnusualSpending() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        List<Map<String, Object>> alerts =
                new ArrayList<>();

        List<Transaction> expenses = transactions
                .stream()
                .filter(transaction ->
                        transaction.getType()
                                == TransactionType.EXPENSE)
                .toList();

        if (expenses.isEmpty()) {
            return alerts;
        }

        BigDecimal totalExpenses = expenses
                .stream()
                .map(Transaction::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        BigDecimal averageExpense = totalExpenses
                .divide(
                        BigDecimal.valueOf(expenses.size()),
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal threshold =
                averageExpense.multiply(
                        BigDecimal.valueOf(2)
                );

        for (Transaction transaction : expenses) {

            if (transaction.getAmount()
                    .compareTo(threshold) > 0) {

                Map<String, Object> alert =
                        new LinkedHashMap<>();

                alert.put(
                        "type",
                        "LARGE_TRANSACTION"
                );

                alert.put(
                        "transactionId",
                        transaction.getId()
                );

                alert.put(
                        "description",
                        transaction.getDescription()
                );

                alert.put(
                        "amount",
                        transaction.getAmount()
                );

                alert.put(
                        "averageExpense",
                        averageExpense
                );

                alert.put(
                        "message",
                        transaction.getDescription()
                                + " spending of $"
                                + transaction.getAmount()
                                + " is much larger than your average transaction."
                );

                alerts.add(alert);
            }
        }

        return alerts;
    }
}