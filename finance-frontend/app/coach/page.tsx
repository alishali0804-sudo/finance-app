"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import {
    authenticatedFetch,
} from "@/lib/auth";

export default function CoachPage() {
    const [question, setQuestion] =
        useState("");

    const [answer, setAnswer] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const suggestedQuestions = [
        "Where am I spending the most?",
        "Why did my spending increase?",
        "What unusual spending should I review?",
        "How am I progressing towards my savings goals?",
    ];

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (!question.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError("");
            setAnswer("");

            const response =
                await authenticatedFetch(
                    "http://localhost:8080/api/ai/coach",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            question,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to get AI response"
                );
            }

            const data =
                await response.json();

            setAnswer(data.answer);
        } catch (err) {
            console.error(err);

            setError(
                "Could not get a response from the AI coach."
            );
        } finally {
            setLoading(false);
        }
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
                            <Link href="/">
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

                            <Link
                                href="/coach"
                                className="font-semibold text-gray-900"
                            >
                                AI Coach
                            </Link>

                            <LogoutButton />
                        </div>
                    </div>
                </nav>

                <div className="mx-auto max-w-4xl p-8">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">
                        AI Finance Coach
                    </h2>

                    <p className="mb-8 text-gray-600">
                        Ask questions about your
                        spending, cash flow and
                        savings goals.
                    </p>

                    <section className="mb-8 rounded-xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">
                            Suggested Questions
                        </h3>

                        <div className="flex flex-wrap gap-3">
                            {suggestedQuestions.map(
                                (
                                    suggestion
                                ) => (
                                    <button
                                        key={
                                            suggestion
                                        }
                                        type="button"
                                        onClick={() =>
                                            setQuestion(
                                                suggestion
                                            )
                                        }
                                        className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {
                                            suggestion
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow">
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Ask your finance
                                coach
                            </label>

                            <textarea
                                required
                                value={
                                    question
                                }
                                onChange={(
                                    event
                                ) =>
                                    setQuestion(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                                placeholder="Why did my spending increase this month?"
                            />

                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Thinking..."
                                    : "Ask AI Coach"}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
                                {
                                    error
                                }
                            </div>
                        )}

                        {answer && (
                            <div className="mt-6 rounded-lg bg-blue-50 p-5">
                                <p className="mb-3 font-semibold text-gray-900">
                                    AI Coach
                                </p>

                                <p className="whitespace-pre-wrap text-gray-700">
                                    {
                                        answer
                                    }
                                </p>
                            </div>
                        )}
                    </section>

                    <p className="mt-4 text-xs text-gray-500">
                        AI responses provide
                        general informational
                        guidance and are not
                        professional financial
                        advice.
                    </p>
                </div>
            </main>
        </AuthGuard>
    );
}