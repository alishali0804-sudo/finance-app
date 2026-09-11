"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Transaction = {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: "INCOME" | "EXPENSE";
    merchant?: string | null;
    source?: string | null;
};

type TransactionForm = {
    description: string;
    amount: string;
    date: string;
    category: string;
    type: "INCOME" | "EXPENSE";
};

export default function TransactionsPage() {
    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [form, setForm] =
        useState<TransactionForm>({
            description: "",
            amount: "",
            date: "",
            category: "",
            type: "EXPENSE",
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8080/api/transactions"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load transactions"
                );
            }

            const data = await response.json();

            setTransactions(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError(
                "Could not load transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/api/transactions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        description:
                        form.description,
                        amount:
                            Number(form.amount),
                        date: form.date,
                        category: form.category,
                        type: form.type,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create transaction"
                );
            }

            setForm({
                description: "",
                amount: "",
                date: "",
                category: "",
                type: "EXPENSE",
            });

            await fetchTransactions();
        } catch (err) {
            console.error(err);
            setError(
                "Could not create transaction."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (
        id: number
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this transaction?"
            );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/transactions/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete transaction"
                );
            }

            await fetchTransactions();
        } catch (err) {
            console.error(err);
            setError(
                "Could not delete transaction."
            );
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
                    <Link
                        href="/"
                        className="text-xl font-bold text-gray-900"
                    >
                        Finance Coach
                    </Link>

                    <div className="flex gap-6 text-sm text-gray-600">
                        <Link href="/">
                            Dashboard
                        </Link>

                        <Link
                            href="/transactions"
                            className="font-semibold text-gray-900"
                        >
                            Transactions
                        </Link>

                        <Link href="/goals">
                            Goals
                        </Link>

                        <Link href="/import">
                            Import
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl p-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Transactions
                </h2>

                <p className="mb-8 text-gray-600">
                    View and manage your income and expenses.
                </p>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">
                        Add Transaction
                    </h3>

                    <form
                        onSubmit={handleSubmit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Description
                            </label>

                            <input
                                type="text"
                                required
                                value={
                                    form.description
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        description:
                                        event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                placeholder="Woolworths"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Amount
                            </label>

                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        amount:
                                        event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                placeholder="67.40"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date
                            </label>

                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        date:
                                        event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <select
                                required
                                value={form.category}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        category:
                                        event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            >
                                <option value="">
                                    Select category
                                </option>

                                <option value="Groceries">
                                    Groceries
                                </option>

                                <option value="Dining">
                                    Dining
                                </option>

                                <option value="Transport">
                                    Transport
                                </option>

                                <option value="Entertainment">
                                    Entertainment
                                </option>

                                <option value="Bills">
                                    Bills
                                </option>

                                <option value="Shopping">
                                    Shopping
                                </option>

                                <option value="Income">
                                    Income
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Type
                            </label>

                            <select
                                value={form.type}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        type:
                                            event.target
                                                .value as
                                                | "INCOME"
                                                | "EXPENSE",
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            >
                                <option value="EXPENSE">
                                    Expense
                                </option>

                                <option value="INCOME">
                                    Income
                                </option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting
                                    ? "Adding..."
                                    : "Add Transaction"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-xl bg-white p-6 shadow">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">
                        Transaction History
                    </h3>

                    {loading ? (
                        <p className="text-gray-600">
                            Loading transactions...
                        </p>
                    ) : transactions.length ===
                    0 ? (
                        <p className="text-gray-600">
                            No transactions found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b border-gray-200 text-sm text-gray-500">
                                    <th className="pb-3">
                                        Date
                                    </th>

                                    <th className="pb-3">
                                        Description
                                    </th>

                                    <th className="pb-3">
                                        Category
                                    </th>

                                    <th className="pb-3">
                                        Type
                                    </th>

                                    <th className="pb-3 text-right">
                                        Amount
                                    </th>

                                    <th className="pb-3 text-right">
                                        Action
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {transactions.map(
                                    (transaction) => (
                                        <tr
                                            key={
                                                transaction.id
                                            }
                                            className="border-b border-gray-100"
                                        >
                                            <td className="py-4 text-gray-600">
                                                {
                                                    transaction.date
                                                }
                                            </td>

                                            <td className="py-4 font-medium text-gray-900">
                                                {
                                                    transaction.description
                                                }
                                            </td>

                                            <td className="py-4 text-gray-600">
                                                {
                                                    transaction.category
                                                }
                                            </td>

                                            <td className="py-4">
                          <span
                              className={
                                  transaction.type ===
                                  "INCOME"
                                      ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                      : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                              }
                          >
                            {
                                transaction.type
                            }
                          </span>
                                            </td>

                                            <td
                                                className={
                                                    transaction.type ===
                                                    "INCOME"
                                                        ? "py-4 text-right font-semibold text-green-600"
                                                        : "py-4 text-right font-semibold text-red-600"
                                                }
                                            >
                                                {transaction.type ===
                                                "INCOME"
                                                    ? "+"
                                                    : "-"}
                                                $
                                                {Number(
                                                    transaction.amount
                                                ).toFixed(2)}
                                            </td>

                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            transaction.id
                                                        )
                                                    }
                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}