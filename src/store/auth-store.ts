import { create } from "zustand";

import { persist } from "zustand/middleware";

export type UserRole =
    | "SUPER_ADMIN"
    | "VENUE_OWNER"
    | "MANAGER"
    | "STAFF"
    | "CUSTOMER";

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
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
                        user,

                        accessToken:
                            access_token,

                        isAuthenticated: true,
                    });
                },

                setUser: (user) =>
                    set({
                        user,

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