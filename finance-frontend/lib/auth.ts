export interface AuthUser {
    userId: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    userId: number;
    name: string;
    email: string;
}

const TOKEN_KEY = "finance_token";
const USER_KEY = "finance_user";

export function saveAuth(data: AuthResponse) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        TOKEN_KEY,
        data.token
    );

    const user: AuthUser = {
        userId: data.userId,
        name: data.name,
        email: data.email,
    };

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );
}

export function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedUser =
        localStorage.getItem(USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    return getToken() !== null;
}

export function logout() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
) {
    const token = getToken();

    const headers =
        new Headers(options.headers);

    if (token) {
        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    return fetch(url, {
        ...options,
        headers,
    });
}