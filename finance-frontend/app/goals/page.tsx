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

type SavingsGoal = {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
};

type GoalProgress = {
    goalId: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    progressPercent: number;
    targetDate: string;
};

type GoalForm = {
    name: string;
    targetAmount: string;
    currentAmount: string;
    targetDate: string;
};

export default function GoalsPage() {
    const [goals, setGoals] =
        useState<SavingsGoal[]>([]);

    const [progressData, setProgressData] =
        useState<
            Record<number, GoalProgress>
        >({});

    const [currentSavingsInputs, setCurrentSavingsInputs] =
        useState<Record<number, string>>({});

    const [form, setForm] =
        useState<GoalForm>({
            name: "",
            targetAmount: "",
            currentAmount: "",
            targetDate: "",
        });

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [updatingGoalId, setUpdatingGoalId] =
        useState<number | null>(null);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const fetchGoals = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await authenticatedFetch(
                    "http://localhost:8080/api/goals"
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load goals"
                );
            }

            const data: SavingsGoal[] =
                await response.json();

            setGoals(data);

            const savingsInputs:
                Record<number, string> = {};

            data.forEach((goal) => {
                savingsInputs[goal.id] =
                    String(goal.currentAmount);
            });

            setCurrentSavingsInputs(
                savingsInputs
            );

            const progressResults:
                Record<number, GoalProgress> =
                {};

            for (const goal of data) {
                const progressResponse =
                    await authenticatedFetch(
                        `http://localhost:8080/api/goals/${goal.id}/progress`
                    );

                if (progressResponse.ok) {
                    const progress:
                        GoalProgress =
                        await progressResponse.json();

                    progressResults[
                        goal.id
                        ] = progress;
                }
            }

            setProgressData(
                progressResults
            );
        } catch (err) {
            console.error(err);

            setError(
                "Could not load savings goals."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            const response =
                await authenticatedFetch(
                    "http://localhost:8080/api/goals",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name: form.name,

                            targetAmount:
                                Number(
                                    form.targetAmount
                                ),

                            currentAmount:
                                Number(
                                    form.currentAmount
                                ),

                            targetDate:
                            form.targetDate,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to create goal"
                );
            }

            setForm({
                name: "",
                targetAmount: "",
                currentAmount: "",
                targetDate: "",
            });

            setSuccessMessage(
                "Savings goal added successfully."
            );

            await fetchGoals();
        } catch (err) {
            console.error(err);

            setError(
                "Could not create savings goal."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSavings = async (
        goal: SavingsGoal
    ) => {
        const newCurrentAmount =
            Number(
                currentSavingsInputs[
                    goal.id
                    ]
            );

        if (
            Number.isNaN(
                newCurrentAmount
            ) ||
            newCurrentAmount < 0
        ) {
            setError(
                "Current savings must be zero or greater."
            );

            return;
        }

        try {
            setUpdatingGoalId(
                goal.id
            );

            setError("");
            setSuccessMessage("");

            const response =
                await authenticatedFetch(
                    `http://localhost:8080/api/goals/${goal.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name:
                            goal.name,

                            targetAmount:
                            goal.targetAmount,

                            currentAmount:
                            newCurrentAmount,

                            targetDate:
                            goal.targetDate,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to update savings"
                );
            }

            setSuccessMessage(
                `${goal.name} savings updated successfully.`
            );

            await fetchGoals();
        } catch (err) {
            console.error(err);

            setError(
                "Could not update current savings."
            );
        } finally {
            setUpdatingGoalId(
                null
            );
        }
    };

    const handleDelete = async (
        id: number
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this savings goal?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const response =
                await authenticatedFetch(
                    `http://localhost:8080/api/goals/${id}`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete goal"
                );
            }

            setSuccessMessage(
                "Savings goal deleted successfully."
            );

            await fetchGoals();
        } catch (err) {
            console.error(err);

            setError(
                "Could not delete savings goal."
            );
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
                            <Link
                                href="/"
                                className="transition hover:text-gray-900"
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
                                href="/import"
                                className="transition hover:text-gray-900"
                            >
                                Import
                            </Link>

                            <Link
                                href="/goals"
                                className="font-semibold text-gray-900"
                            >
                                Goals
                            </Link>

                            <Link
                                href="/coach"
                                className="transition hover:text-gray-900"
                            >
                                AI Coach
                            </Link>

                            <LogoutButton />
                        </div>
                    </div>
                </nav>

                <div className="mx-auto max-w-6xl p-8">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">
                        Savings Goals
                    </h2>

                    <p className="mb-8 text-gray-600">
                        Set financial goals and
                        track your progress.
                    </p>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                            {
                                successMessage
                            }
                        </div>
                    )}

                    <section className="mb-8 rounded-xl bg-white p-6 shadow">
                        <h3 className="mb-6 text-xl font-bold text-gray-900">
                            Add Savings Goal
                        </h3>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Goal Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={
                                        form.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm({
                                            ...form,
                                            name:
                                            event
                                                .target
                                                .value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    placeholder="Japan Trip"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Target Amount
                                </label>

                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        form.targetAmount
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm({
                                            ...form,
                                            targetAmount:
                                            event
                                                .target
                                                .value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    placeholder="5000"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Current Amount
                                </label>

                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.currentAmount
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm({
                                            ...form,
                                            currentAmount:
                                            event
                                                .target
                                                .value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    placeholder="1800"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Target Date
                                </label>

                                <input
                                    type="date"
                                    required
                                    value={
                                        form.targetDate
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm({
                                            ...form,
                                            targetDate:
                                            event
                                                .target
                                                .value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Adding..."
                                        : "Add Goal"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section>
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Your Goals
                        </h3>

                        {loading ? (
                            <p className="text-gray-600">
                                Loading goals...
                            </p>
                        ) : goals.length ===
                        0 ? (
                            <div className="rounded-xl bg-white p-6 shadow">
                                <p className="text-gray-600">
                                    No savings
                                    goals yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                {goals.map(
                                    (goal) => {
                                        const progress =
                                            progressData[
                                                goal
                                                    .id
                                                ];

                                        return (
                                            <div
                                                key={
                                                    goal.id
                                                }
                                                className="rounded-xl bg-white p-6 shadow"
                                            >
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-900">
                                                            {
                                                                goal.name
                                                            }
                                                        </h4>

                                                        <p className="text-sm text-gray-500">
                                                            Target
                                                            date:{" "}
                                                            {
                                                                goal.targetDate
                                                            }
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                goal.id
                                                            )
                                                        }
                                                        className="text-sm font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="mb-2 flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            Progress
                                                        </span>

                                                        <span className="font-semibold text-gray-900">
                                                            {progress
                                                                ? Number(
                                                                    progress.progressPercent
                                                                ).toFixed(
                                                                    2
                                                                )
                                                                : "0.00"}
                                                            %
                                                        </span>
                                                    </div>

                                                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-blue-600"
                                                            style={{
                                                                width: `${
                                                                    progress
                                                                        ? Math.min(
                                                                            Number(
                                                                                progress.progressPercent
                                                                            ),
                                                                            100
                                                                        )
                                                                        : 0
                                                                }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">
                                                            Saved
                                                        </p>

                                                        <p className="font-semibold text-gray-900">
                                                            $
                                                            {Number(
                                                                goal.currentAmount
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-500">
                                                            Target
                                                        </p>

                                                        <p className="font-semibold text-gray-900">
                                                            $
                                                            {Number(
                                                                goal.targetAmount
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-500">
                                                            Remaining
                                                        </p>

                                                        <p className="font-semibold text-gray-900">
                                                            $
                                                            {progress
                                                                ? Number(
                                                                    progress.remainingAmount
                                                                ).toFixed(
                                                                    2
                                                                )
                                                                : "0.00"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-5">
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Update Current Savings
                                                    </label>

                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                currentSavingsInputs[
                                                                    goal
                                                                        .id
                                                                    ] ??
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setCurrentSavingsInputs(
                                                                    {
                                                                        ...currentSavingsInputs,

                                                                        [goal.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                            placeholder="Enter amount saved"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateSavings(
                                                                    goal
                                                                )
                                                            }
                                                            disabled={
                                                                updatingGoalId ===
                                                                goal.id
                                                            }
                                                            className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {updatingGoalId ===
                                                            goal.id
                                                                ? "Updating..."
                                                                : "Update Savings"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </AuthGuard>
    );
}