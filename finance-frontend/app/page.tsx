"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import {
    authenticatedFetch,
    getUser,
} from "@/lib/auth";

interface Summary {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface MonthlyData {
    month: string;
    amount: number;
}

export default function Home() {
    const user = getUser();

    const [summary, setSummary] =
        useState<Summary>({
            totalIncome: 0,
            totalExpenses: 0,
            netCashFlow: 0,
        });

    const [categoryData, setCategoryData] =
        useState<CategoryData[]>([]);

    const [monthlyData, setMonthlyData] =
        useState<MonthlyData[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const [
                    summaryResponse,
                    categoryResponse,
                    monthlyResponse,
                ] = await Promise.all([
                    authenticatedFetch(
                        "http://localhost:8080/api/analytics/summary"
                    ),

                    authenticatedFetch(
                        "http://localhost:8080/api/analytics/categories"
                    ),

                    authenticatedFetch(
                        "http://localhost:8080/api/analytics/monthly"
                    ),
                ]);

                if (
                    !summaryResponse.ok ||
                    !categoryResponse.ok ||
                    !monthlyResponse.ok
                ) {
                    throw new Error(
                        "Failed to load dashboard data."
                    );
                }

                const summaryJson =
                    await summaryResponse.json();

                const categoryJson =
                    await categoryResponse.json();

                const monthlyJson =
                    await monthlyResponse.json();

                setSummary(summaryJson);

                const categories =
                    Object.entries(categoryJson).map(
                        ([name, value]) => ({
                            name,
                            value: Number(value),
                        })
                    );

                setCategoryData(categories);

                const months =
                    Object.entries(monthlyJson).map(
                        ([month, amount]) => ({
                            month,
                            amount: Number(amount),
                        })
                    );

                setMonthlyData(months);
            } catch (err) {
                console.error(err);

                setError(
                    "Could not load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const formatCurrency = (
        value: number
    ) => {
        return new Intl.NumberFormat(
            "en-AU",
            {
                style: "currency",
                currency: "AUD",
            }
        ).format(value);
    };

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
                            <Link
                                href="/"
                                className="font-semibold text-gray-900"
                            >
                                Dashboard
                            </Link>

                            <Link href="/transactions">
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
                            Welcome
                            {user
                                ? `, ${user.name}`
                                : ""}
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Here is an overview of your
                            finances.
                        </p>
                    </div>

                    {loading && (
                        <div className="rounded-xl bg-white p-6 shadow">
                            <p className="text-gray-600">
                                Loading dashboard...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <section className="mb-8 grid gap-6 md:grid-cols-3">
                                <div className="rounded-xl bg-white p-6 shadow">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Income
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                            summary.totalIncome
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white p-6 shadow">
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Expenses
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                            summary.totalExpenses
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white p-6 shadow">
                                    <p className="text-sm font-medium text-gray-500">
                                        Net Cash Flow
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                            summary.netCashFlow
                                        )}
                                    </p>
                                </div>
                            </section>

                            <section className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-xl bg-white p-6 shadow">
                                    <h2 className="mb-4 text-xl font-bold text-gray-900">
                                        Spending by Category
                                    </h2>

                                    {categoryData.length === 0 ? (
                                        <p className="text-gray-500">
                                            No spending data yet.
                                        </p>
                                    ) : (
                                        <div className="h-80">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={categoryData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        label
                                                    >
                                                        {categoryData.map(
                                                            (_, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                />
                                                            )
                                                        )}
                                                    </Pie>

                                                    <Tooltip
                                                        formatter={(
                                                            value
                                                        ) =>
                                                            formatCurrency(
                                                                Number(value)
                                                            )
                                                        }
                                                    />

                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl bg-white p-6 shadow">
                                    <h2 className="mb-4 text-xl font-bold text-gray-900">
                                        Monthly Spending
                                    </h2>

                                    {monthlyData.length === 0 ? (
                                        <p className="text-gray-500">
                                            No monthly spending
                                            data yet.
                                        </p>
                                    ) : (
                                        <div className="h-80">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={monthlyData}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                    />

                                                    <XAxis
                                                        dataKey="month"
                                                    />

                                                    <YAxis />

                                                    <Tooltip
                                                        formatter={(
                                                            value
                                                        ) =>
                                                            formatCurrency(
                                                                Number(value)
                                                            )
                                                        }
                                                    />

                                                    <Bar
                                                        dataKey="amount"
                                                        name="Spending"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}