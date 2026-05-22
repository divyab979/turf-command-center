import {
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/services/auth-service";

import { useAuthStore } from "@/store/auth-store";

export const AuthProvider = ({
  children,
}: PropsWithChildren) => {

  const [mounted, setMounted] =
    useState(false);

  const logout =
    useAuthStore(
      (s) => s.logout
    );

  const setUser =
    useAuthStore(
      (s) => s.setUser
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  const token =
    mounted
      ? localStorage.getItem(
          "access_token"
        )
      : null;

  const { data, error } =
    useQuery({
      queryKey: ["me"],

      queryFn:
        getCurrentUser,

      enabled:
        mounted && !!token,

      retry: false,
    });

  useEffect(() => {
    if (data) {
      setUser(data);
    }

    if (error) {
      logout();
    }
  }, [
    data,
    error,
    logout,
    setUser,
  ]);

  return children;
};