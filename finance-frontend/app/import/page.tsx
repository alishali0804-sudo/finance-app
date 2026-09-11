"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

type ImportedTransaction = {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: "INCOME" | "EXPENSE";
    rawDescription?: string | null;
    merchant?: string | null;
    source?: string | null;
};

export default function ImportPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importedTransactions, setImportedTransactions] = useState<
        ImportedTransaction[]
    >([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        setSelectedFile(file);
        setError("");
        setSuccessMessage("");
        setImportedTransactions([]);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            setError("Please select a CSV file first.");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccessMessage("");
            setImportedTransactions([]);

            const formData = new FormData();

            formData.append("file", selectedFile);

            const response = await fetch(
                "http://localhost:8080/api/transactions/import",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to import CSV file");
            }

            const data: ImportedTransaction[] = await response.json();

            setImportedTransactions(data);

            setSuccessMessage(
                `${data.length} transaction${
                    data.length === 1 ? "" : "s"
                } imported successfully.`
            );
        } catch (err) {
            console.error(err);
            setError(
                "Could not import the CSV file. Check the file format and try again."
            );
        } finally {
            setUploading(false);
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

                        <Link href="/transactions">
                            Transactions
                        </Link>

                        <Link href="/goals">
                            Goals
                        </Link>

                        <Link
                            href="/import"
                            className="font-semibold text-gray-900"
                        >
                            Import
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl p-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Import Transactions
                </h2>

                <p className="mb-8 text-gray-600">
                    Upload a CSV bank export to automatically add transactions.
                </p>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                        {successMessage}
                    </div>
                )}

                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                        Upload CSV
                    </h3>

                    <p className="mb-6 text-sm text-gray-600">
                        Your current importer expects columns for Date, Description and
                        Amount.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                                className="mx-auto block text-sm text-gray-700"
                            />

                            {selectedFile && (
                                <p className="mt-4 text-sm text-gray-600">
                                    Selected file:{" "}
                                    <span className="font-medium text-gray-900">
                    {selectedFile.name}
                  </span>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading
                                ? "Importing..."
                                : "Import Transactions"}
                        </button>
                    </form>
                </section>

                <section className="rounded-xl bg-white p-6 shadow">
                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                        Expected CSV Format
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr className="border-b border-gray-200 text-gray-500">
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Description</th>
                                <th className="pb-3">Amount</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 text-gray-700">
                                    11/09/2026
                                </td>

                                <td className="py-3 text-gray-700">
                                    WOOLWORTHS 3147
                                </td>

                                <td className="py-3 text-red-600">
                                    -67.40
                                </td>
                            </tr>

                            <tr>
                                <td className="py-3 text-gray-700">
                                    10/09/2026
                                </td>

                                <td className="py-3 text-gray-700">
                                    PAYROLL ACME PTY LTD
                                </td>

                                <td className="py-3 text-green-600">
                                    2500.00
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Negative amounts are treated as expenses and positive amounts are
                        treated as income.
                    </p>
                </section>

                {importedTransactions.length > 0 && (
                    <section className="mt-8 rounded-xl bg-white p-6 shadow">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                Imported Transactions
                            </h3>

                            <Link
                                href="/transactions"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all transactions
                            </Link>
                        </div>

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
                                </tr>
                                </thead>

                                <tbody>
                                {importedTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-gray-100"
                                    >
                                        <td className="py-4 text-gray-600">
                                            {transaction.date}
                                        </td>

                                        <td className="py-4 font-medium text-gray-900">
                                            {transaction.description}
                                        </td>

                                        <td className="py-4 text-gray-600">
                                            {transaction.category}
                                        </td>

                                        <td className="py-4">
                        <span
                            className={
                                transaction.type === "INCOME"
                                    ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                    : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                            }
                        >
                          {transaction.type}
                        </span>
                                        </td>

                                        <td
                                            className={
                                                transaction.type === "INCOME"
                                                    ? "py-4 text-right font-semibold text-green-600"
                                                    : "py-4 text-right font-semibold text-red-600"
                                            }
                                        >
                                            {transaction.type === "INCOME"
                                                ? "+"
                                                : "-"}
                                            $
                                            {Number(
                                                transaction.amount
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}