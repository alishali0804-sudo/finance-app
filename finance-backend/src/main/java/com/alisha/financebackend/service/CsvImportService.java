package com.alisha.financebackend.service;

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

    public CsvImportService(
            TransactionRepository transactionRepository,
            CategorisationService categorisationService
    ) {
        this.transactionRepository = transactionRepository;
        this.categorisationService = categorisationService;
    }

    public List<Transaction> importCsv(MultipartFile file) {

        List<Transaction> transactions = new ArrayList<>();

        DateTimeFormatter dateFormatter =
                DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try (
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(file.getInputStream())
                )
        ) {

            String line;

            // Skip header
            reader.readLine();

            while ((line = reader.readLine()) != null) {

                String[] values = line.split(",");

                if (values.length < 3) {
                    continue;
                }

                String dateText = values[0].trim();
                String rawDescription = values[1].trim();

                BigDecimal rawAmount =
                        new BigDecimal(values[2].trim());

                TransactionType type;

                if (rawAmount.compareTo(BigDecimal.ZERO) < 0) {
                    type = TransactionType.EXPENSE;
                } else {
                    type = TransactionType.INCOME;
                }

                BigDecimal amount = rawAmount.abs();

                String category =
                        categorisationService.categorise(rawDescription);

                String merchant =
                        categorisationService.extractMerchant(rawDescription);

                Transaction transaction = new Transaction(
                        merchant,
                        amount,
                        LocalDate.parse(dateText, dateFormatter),
                        category,
                        type
                );

                transaction.setRawDescription(rawDescription);
                transaction.setMerchant(merchant);
                transaction.setSource("CSV_IMPORT");

                transactions.add(transaction);
            }

            return transactionRepository.saveAll(transactions);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to import CSV file: " + e.getMessage()
            );
        }
    }
}