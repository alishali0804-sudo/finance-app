package com.alisha.financebackend.service;

import org.springframework.stereotype.Service;

@Service
public class CategorisationService {

    public String categorise(String description) {

        String text = description.toLowerCase();

        if (text.contains("woolworths") || text.contains("coles")) {
            return "Groceries";
        }

        if (text.contains("uber") || text.contains("myki") || text.contains("shell")) {
            return "Transport";
        }

        if (text.contains("netflix") || text.contains("spotify")) {
            return "Entertainment";
        }

        if (text.contains("optus") || text.contains("telstra")) {
            return "Bills";
        }

        if (text.contains("mcdonald") || text.contains("kfc") || text.contains("restaurant")) {
            return "Dining";
        }

        if (text.contains("salary") || text.contains("payroll")) {
            return "Income";
        }

        return "Other";
    }

    public String extractMerchant(String description) {

        String text = description.toLowerCase();

        if (text.contains("woolworths")) {
            return "Woolworths";
        }

        if (text.contains("coles")) {
            return "Coles";
        }

        if (text.contains("uber")) {
            return "Uber";
        }

        if (text.contains("netflix")) {
            return "Netflix";
        }

        if (text.contains("spotify")) {
            return "Spotify";
        }

        if (text.contains("optus")) {
            return "Optus";
        }

        if (text.contains("telstra")) {
            return "Telstra";
        }

        if (text.contains("mcdonald")) {
            return "McDonalds";
        }

        if (text.contains("kfc")) {
            return "KFC";
        }

        if (text.contains("salary") || text.contains("payroll")) {
            return "Salary";
        }

        return description;
    }
}