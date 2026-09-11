"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function LogoutButton() {
    const router = useRouter();

    function handleLogout() {
        logout();

        router.push("/login");
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
        >
            Logout
        </button>
    );
}