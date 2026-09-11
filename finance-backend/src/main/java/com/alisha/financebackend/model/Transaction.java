package com.alisha.financebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Description is required")
    @Column(nullable = false)
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than 0"
    )
    @Column(nullable = false)
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @NotNull(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    private String rawDescription;

    private String merchant;

    private String source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private AppUser user;

    public Transaction() {
    }

    public Transaction(
            String description,
            BigDecimal amount,
            LocalDate date,
            String category,
            TransactionType type
    ) {
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getCategory() {
        return category;
    }

    public TransactionType getType() {
        return type;
    }

    public String getRawDescription() {
        return rawDescription;
    }

    public String getMerchant() {
        return merchant;
    }

    public String getSource() {
        return source;
    }

    public AppUser getUser() {
        return user;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount = amount;
    }

    public void setDate(
            LocalDate date
    ) {
        this.date = date;
    }

    public void setCategory(
            String category
    ) {
        this.category = category;
    }

    public void setType(
            TransactionType type
    ) {
        this.type = type;
    }

    public void setRawDescription(
            String rawDescription
    ) {
        this.rawDescription = rawDescription;
    }

    public void setMerchant(
            String merchant
    ) {
        this.merchant = merchant;
    }

    public void setSource(
            String source
    ) {
        this.source = source;
    }

    public void setUser(
            AppUser user
    ) {
        this.user = user;
    }
}