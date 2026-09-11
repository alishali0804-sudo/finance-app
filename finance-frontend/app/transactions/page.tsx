"use client";

import Link from "next/link";
import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import {
    authenticatedFetch,
} from "@/lib/auth";

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: "INCOME" | "EXPENSE";
}

export default function TransactionsPage() {
    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [description, setDescription] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [date, setDate] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [type, setType] =
        useState<"INCOME" | "EXPENSE">(
            "EXPENSE"
        );

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    async function loadTransactions() {
        try {
            setLoading(true);
            setError("");

            const response =
                await authenticatedFetch(
                    "http://localhost:8080/api/transactions"
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load transactions."
                );
            }

            const data: Transaction[] =
                await response.json();

            setTransactions(data);
        } catch (err) {
            console.error(err);

            setError(
                "Could not load transactions."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    async function handleSubmit(
        event: FormEvent
    ) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            const response =
                await authenticatedFetch(
                    "http://localhost:8080/api/transactions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            description,
                            amount: Number(amount),
                            date,
                            category,
                            type,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to create transaction."
                );
            }

            setDescription("");
            setAmount("");
            setDate("");
            setCategory("");
            setType("EXPENSE");

            await loadTransactions();
        } catch (err) {
            console.error(err);

            setError(
                "Could not create transaction."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(
        id: number
    ) {
        try {
            setError("");

            const response =
                await authenticatedFetch(
                    `http://localhost:8080/api/transactions/${id}`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete transaction."
                );
            }

            setTransactions(
                transactions.filter(
                    (transaction) =>
                        transaction.id !== id
                )
            );
        } catch (err) {
            console.error(err);

            setError(
                "Could not delete transaction."
            );
        }
    }

    function formatCurrency(
        value: number
    ) {
        return new Intl.NumberFormat(
            "en-AU",
            {
                style: "currency",
                currency: "AUD",
            }
        ).format(value);
    }

    return (
        <AuthGuard>
            <main className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
                        <Link
                            href="/"
                            className="text-xl font-bold text-gray-900"
                        >
                            Finance Coach
                        </Link>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
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

                            <Link href="/coach">
                                AI Coach
                            </Link>

                            <LogoutButton />
                        </div>
                    </div>
                </nav>

                <div className="mx-auto max-w-6xl p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Transactions
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Add and review your
                            transactions.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    <section className="mb-8 rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            Add Transaction
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                                    placeholder="Woolworths"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                                    placeholder="50.00"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(event) =>
                                        setDate(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                                    placeholder="Groceries"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Type
                                </label>

                                <select
                                    value={type}
                                    onChange={(event) =>
                                        setType(
                                            event.target.value as
                                                | "INCOME"
                                                | "EXPENSE"
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
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
                                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Adding..."
                                        : "Add Transaction"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            Transaction History
                        </h2>

                        {loading ? (
                            <p className="text-gray-600">
                                Loading transactions...
                            </p>
                        ) : transactions.length === 0 ? (
                            <p className="text-gray-500">
                                No transactions yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                    <tr className="border-b text-sm text-gray-500">
                                        <th className="px-3 py-3">
                                            Date
                                        </th>

                                        <th className="px-3 py-3">
                                            Description
                                        </th>

                                        <th className="px-3 py-3">
                                            Category
                                        </th>

                                        <th className="px-3 py-3">
                                            Type
                                        </th>

                                        <th className="px-3 py-3">
                                            Amount
                                        </th>

                                        <th className="px-3 py-3">
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
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-3 py-4 text-gray-700">
                                                    {
                                                        transaction.date
                                                    }
                                                </td>

                                                <td className="px-3 py-4 font-medium text-gray-900">
                                                    {
                                                        transaction.description
                                                    }
                                                </td>

                                                <td className="px-3 py-4 text-gray-700">
                                                    {
                                                        transaction.category
                                                    }
                                                </td>

                                                <td className="px-3 py-4 text-gray-700">
                                                    {
                                                        transaction.type
                                                    }
                                                </td>

                                                <td className="px-3 py-4 font-medium text-gray-900">
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </td>

                                                <td className="px-3 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                transaction.id
                                                            )
                                                        }
                                                        className="text-sm font-medium text-red-600 hover:text-red-700"
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
        </AuthGuard>
    );
}