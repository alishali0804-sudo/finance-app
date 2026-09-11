package com.alisha.financebackend.controller;

import com.alisha.financebackend.service.AnalyticsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public Map<String, BigDecimal> getSummary() {
        return analyticsService.getSummary();
    }

    @GetMapping("/categories")
    public Map<String, BigDecimal> getSpendingByCategory() {
        return analyticsService.getSpendingByCategory();
    }

    @GetMapping("/monthly")
    public Map<String, BigDecimal> getMonthlySpending() {
        return analyticsService.getMonthlySpending();
    }

    @GetMapping("/comparison")
    public Map<String, Object> getMonthlyComparison() {
        return analyticsService.getMonthlyComparison();
    }

    @GetMapping("/category-comparison")
    public Map<String, Map<String, BigDecimal>>
    getCategoryComparison() {
        return analyticsService.getCategoryComparison();
    }

    @GetMapping("/unusual")
    public List<Map<String, Object>>
    getUnusualSpending() {
        return analyticsService.getUnusualSpending();
    }
}