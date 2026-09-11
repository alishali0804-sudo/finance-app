package com.alisha.financebackend.controller;

import com.alisha.financebackend.model.Transaction;
import com.alisha.financebackend.service.CsvImportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class CsvImportController {

    private final CsvImportService csvImportService;

    public CsvImportController(
            CsvImportService csvImportService
    ) {
        this.csvImportService = csvImportService;
    }

    @PostMapping("/import")
    public List<Transaction> importTransactions(
            @RequestParam("file") MultipartFile file
    ) {
        return csvImportService.importCsv(file);
    }
}