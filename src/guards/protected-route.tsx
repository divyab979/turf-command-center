import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import { Navigate } from "@tanstack/react-router";

import { useAuthStore } from "@/store/auth-store";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({
  children,
}: Props) => {

  const isAuthenticated =
    useAuthStore(
      (s) => s.isAuthenticated
    );

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" />
    );
  }

  return <>{children}</>;
};