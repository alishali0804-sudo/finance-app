"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
};

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/analytics/summary")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch analytics");
          }

          return response.json();
        })
        .then((data) => {
          setSummary(data);
        })
        .catch((error) => {
          console.error(error);
          setError("Could not load analytics.");
        });
  }, []);

  return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Personal Finance Dashboard
          </h1>

          <p className="mb-8 text-gray-600">
            Track your income, expenses and cash flow.
          </p>

          {error && (
              <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
          )}

          {!summary && !error && (
              <p className="text-gray-600">Loading analytics...</p>
          )}

          {summary && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-sm text-gray-500">Total Income</p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    ${Number(summary.totalIncome).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-sm text-gray-500">Total Expenses</p>

                  <p className="mt-2 text-3xl font-bold text-red-600">
                    ${Number(summary.totalExpenses).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-sm text-gray-500">Net Cash Flow</p>

                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    ${Number(summary.netCashFlow).toFixed(2)}
                  </p>
                </div>
              </div>
          )}
        </div>
      </main>
  );
}