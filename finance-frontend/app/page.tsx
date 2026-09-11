"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

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
            .then(
                async ([
                           summaryResponse,
                           categoryResponse,
                           monthlyResponse,
                       ]) => {
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
                }
            )
            .catch((error) => {
                console.error(error);
                setError("Could not load dashboard data.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const categoryChartData = Object.entries(categories).map(
        ([category, amount]) => ({
            name: category,
            value: Number(amount),
        })
    );

    const monthlyChartData = Object.entries(monthly).map(
        ([month, amount]) => ({
            month,
            spending: Number(amount),
        })
    );

    const pieColours = [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#9333ea",
        "#f59e0b",
        "#0891b2",
        "#db2777",
        "#64748b",
    ];

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
                        <Link
                            href="/"
                            className="font-semibold text-gray-900"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/transactions"
                            className="transition hover:text-gray-900"
                        >
                            Transactions
                        </Link>

                        <Link
                            href="/goals"
                            className="transition hover:text-gray-900"
                        >
                            Goals
                        </Link>

                        <span className="cursor-default">
              Import
            </span>
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

                        {categoryChartData.length === 0 && !loading ? (
                            <p className="text-gray-500">
                                No category data available.
                            </p>
                        ) : (
                            <div className="h-80">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {categoryChartData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`${entry.name}-${index}`}
                                                        fill={
                                                            pieColours[
                                                            index % pieColours.length
                                                                ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            formatter={(value) =>
                                                `$${Number(value).toFixed(2)}`
                                            }
                                        />

                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Monthly Spending
                        </h3>

                        {monthlyChartData.length === 0 && !loading ? (
                            <p className="text-gray-500">
                                No monthly data available.
                            </p>
                        ) : (
                            <div className="h-80">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart data={monthlyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis dataKey="month" />

                                        <YAxis />

                                        <Tooltip
                                            formatter={(value) =>
                                                `$${Number(value).toFixed(2)}`
                                            }
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="spending"
                                            name="Spending"
                                            fill="#2563eb"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}