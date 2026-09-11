"use client";

import { useEffect, useState } from "react";

type Summary = {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
};

type CategorySpending = {
    [category: string]: number;
};

type MonthlySpending = {
    [month: string]: number;
};

export default function Home() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [categories, setCategories] = useState<CategorySpending>({});
    const [monthly, setMonthly] = useState<MonthlySpending>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:8080/api/analytics/summary"),
            fetch("http://localhost:8080/api/analytics/categories"),
            fetch("http://localhost:8080/api/analytics/monthly"),
        ])
            .then(async ([summaryResponse, categoryResponse, monthlyResponse]) => {
                if (
                    !summaryResponse.ok ||
                    !categoryResponse.ok ||
                    !monthlyResponse.ok
                ) {
                    throw new Error("Failed to load analytics");
                }

                const summaryData = await summaryResponse.json();
                const categoryData = await categoryResponse.json();
                const monthlyData = await monthlyResponse.json();

                setSummary(summaryData);
                setCategories(categoryData);
                setMonthly(monthlyData);
            })
            .catch((error) => {
                console.error(error);
                setError("Could not load dashboard data.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        Finance Coach
                    </h1>

                    <div className="flex gap-6 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Dashboard</span>
                        <span>Transactions</span>
                        <span>Goals</span>
                        <span>Import</span>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl p-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Personal Finance Dashboard
                </h2>

                <p className="mb-8 text-gray-600">
                    Track your income, expenses and spending patterns.
                </p>

                {loading && (
                    <p className="text-gray-600">
                        Loading dashboard...
                    </p>
                )}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {summary && (
                    <div className="mb-8 grid gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow">
                            <p className="text-sm text-gray-500">
                                Total Income
                            </p>

                            <p className="mt-2 text-3xl font-bold text-green-600">
                                ${Number(summary.totalIncome).toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow">
                            <p className="text-sm text-gray-500">
                                Total Expenses
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-600">
                                ${Number(summary.totalExpenses).toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow">
                            <p className="text-sm text-gray-500">
                                Net Cash Flow
                            </p>

                            <p className="mt-2 text-3xl font-bold text-blue-600">
                                ${Number(summary.netCashFlow).toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 md:grid-cols-2">
                    <section className="rounded-xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Spending by Category
                        </h3>

                        {Object.keys(categories).length === 0 && !loading ? (
                            <p className="text-gray-500">
                                No category data available.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(categories).map(([category, amount]) => (
                                    <div
                                        key={category}
                                        className="flex items-center justify-between border-b border-gray-100 pb-3"
                                    >
                    <span className="text-gray-700">
                      {category}
                    </span>

                                        <span className="font-semibold text-gray-900">
                      ${Number(amount).toFixed(2)}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Monthly Spending
                        </h3>

                        {Object.keys(monthly).length === 0 && !loading ? (
                            <p className="text-gray-500">
                                No monthly data available.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(monthly).map(([month, amount]) => (
                                    <div
                                        key={month}
                                        className="flex items-center justify-between border-b border-gray-100 pb-3"
                                    >
                    <span className="text-gray-700">
                      {month}
                    </span>

                                        <span className="font-semibold text-gray-900">
                      ${Number(amount).toFixed(2)}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}