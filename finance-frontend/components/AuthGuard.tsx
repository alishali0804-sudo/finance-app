"use client";

import {
    ReactNode,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    isLoggedIn,
} from "@/lib/auth";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({
                                      children,
                                  }: AuthGuardProps) {
    const router = useRouter();

    const [checking, setChecking] =
        useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login");
            return;
        }

        setChecking(false);
    }, [router]);

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Loading...
                </p>
            </main>
        );
    }

    return <>{children}</>;
}