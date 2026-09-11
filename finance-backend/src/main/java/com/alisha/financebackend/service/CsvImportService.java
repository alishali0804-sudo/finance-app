package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.Transaction;
import com.alisha.financebackend.model.TransactionType;
import com.alisha.financebackend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvImportService {

    private final TransactionRepository transactionRepository;
    private final CategorisationService categorisationService;
    private final CurrentUserService currentUserService;

    public CsvImportService(
            TransactionRepository transactionRepository,
            CategorisationService categorisationService,
            CurrentUserService currentUserService
    ) {
        this.transactionRepository = transactionRepository;
        this.categorisationService = categorisationService;
        this.currentUserService = currentUserService;
    }

    public List<Transaction> importCsv(
            MultipartFile file
    ) {

        AppUser currentUser =
                currentUserService.getCurrentUser();

        List<Transaction> importedTransactions =
                new ArrayList<>();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "dd/MM/yyyy"
                );

        try (
                BufferedReader reader =
                        new BufferedReader(
                                new InputStreamReader(
                                        file.getInputStream()
                                )
                        )
        ) {

            String line;

            boolean firstLine = true;

            while (
                    (line = reader.readLine())
                            != null
            ) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                if (line.isBlank()) {
                    continue;
                }

                String[] values =
                        line.split(",");

                if (values.length < 3) {
                    continue;
                }

                String dateValue =
                        values[0].trim();

                String rawDescription =
                        values[1].trim();

                String amountValue =
                        values[2].trim();

                LocalDate date =
                        LocalDate.parse(
                                dateValue,
                                formatter
                        );

                BigDecimal rawAmount =
                        new BigDecimal(
                                amountValue
                        );

                TransactionType type;

                if (
                        rawAmount.compareTo(
                                BigDecimal.ZERO
                        ) < 0
                ) {
                    type =
                            TransactionType.EXPENSE;
                } else {
                    type =
                            TransactionType.INCOME;
                }

                BigDecimal amount =
                        rawAmount.abs();

                String category =
                        categorisationService
                                .categorise(
                                        rawDescription
                                );

                String merchant =
                        categorisationService
                                .extractMerchant(
                                        rawDescription
                                );

                Transaction transaction =
                        new Transaction(
                                merchant,
                                amount,
                                date,
                                category,
                                type
                        );

                transaction.setRawDescription(
                        rawDescription
                );

                transaction.setMerchant(
                        merchant
                );

                transaction.setSource(
                        "CSV_IMPORT"
                );

                transaction.setUser(
                        currentUser
                );

                Transaction savedTransaction =
                        transactionRepository.save(
                                transaction
                        );

                importedTransactions.add(
                        savedTransaction
                );
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to import CSV: "
                            + e.getMessage(),
                    e
            );
        }

        return importedTransactions;
    }
}