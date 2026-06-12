import { create } from "zustand";

import { persist } from "zustand/middleware";

export type UserRole =
    | "SUPER_ADMIN"
    | "OWNER"
    | "SUPERVISOR";

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    venueId?: string;
}

interface AuthStore {
    user: User | null;

    accessToken: string | null;

    isAuthenticated: boolean;

    login: (data: {
        user: User;
        access_token: string;
    }) => void;

    setUser: (user: User) => void;

    logout: () => void;
}

const mapRole = (role: string): UserRole => {
    if (role === "VENUE_OWNER") return "OWNER";
    if (role === "MANAGER") return "SUPERVISOR";
    return role as UserRole;
};

export const useAuthStore =
    create<AuthStore>()(
        persist(
            (set) => ({
                user: null,

                accessToken: null,

                isAuthenticated: false,

                login: ({
                    user,
                    access_token,
                }) => {
                    localStorage.setItem(
                        "access_token",
                        access_token
                    );

                    set({
                        user: {
                            ...user,
                            role: mapRole(user.role),
                        },

                        accessToken:
                            access_token,

                        isAuthenticated: true,
                    });
                },

                setUser: (user) =>
                    set({
                        user: {
                            ...user,
                            role: mapRole(user.role),
                        },

                        isAuthenticated: true,
                    }),

                logout: () => {
                    localStorage.removeItem(
                        "access_token"
                    );

                    set({
                        user: null,

                        accessToken: null,

                        isAuthenticated: false,
                    });
                },
            }),
            {
                name: "auth-storage",
            }
        )
    );