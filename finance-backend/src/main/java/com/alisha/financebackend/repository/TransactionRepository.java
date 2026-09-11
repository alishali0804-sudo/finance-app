package com.alisha.financebackend.repository;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByDateDesc(
            AppUser user
    );

    Optional<Transaction> findByIdAndUser(
            Long id,
            AppUser user
    );
}