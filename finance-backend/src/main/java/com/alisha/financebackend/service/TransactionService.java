package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.Transaction;
import com.alisha.financebackend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository
            transactionRepository;

    private final CurrentUserService
            currentUserService;

    public TransactionService(
            TransactionRepository transactionRepository,
            CurrentUserService currentUserService
    ) {
        this.transactionRepository =
                transactionRepository;

        this.currentUserService =
                currentUserService;
    }

    public List<Transaction>
    getAllTransactions() {

        AppUser user =
                currentUserService
                        .getCurrentUser();

        return transactionRepository
                .findByUserOrderByDateDesc(
                        user
                );
    }

    public Transaction createTransaction(
            Transaction transaction
    ) {

        AppUser user =
                currentUserService
                        .getCurrentUser();

        transaction.setUser(user);

        return transactionRepository
                .save(transaction);
    }

    public Transaction getTransactionById(
            Long id
    ) {

        AppUser user =
                currentUserService
                        .getCurrentUser();

        return transactionRepository
                .findByIdAndUser(
                        id,
                        user
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Transaction not found"
                        )
                );
    }

    public Transaction updateTransaction(
            Long id,
            Transaction updatedTransaction
    ) {

        AppUser user =
                currentUserService
                        .getCurrentUser();

        Transaction existingTransaction =
                transactionRepository
                        .findByIdAndUser(
                                id,
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Transaction not found"
                                        )
                        );

        existingTransaction.setDescription(
                updatedTransaction.getDescription()
        );

        existingTransaction.setAmount(
                updatedTransaction.getAmount()
        );

        existingTransaction.setDate(
                updatedTransaction.getDate()
        );

        existingTransaction.setCategory(
                updatedTransaction.getCategory()
        );

        existingTransaction.setType(
                updatedTransaction.getType()
        );

        return transactionRepository.save(
                existingTransaction
        );
    }

    public void deleteTransaction(
            Long id
    ) {

        AppUser user =
                currentUserService
                        .getCurrentUser();

        Transaction transaction =
                transactionRepository
                        .findByIdAndUser(
                                id,
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Transaction not found"
                                        )
                        );

        transactionRepository.delete(
                transaction
        );
    }
}