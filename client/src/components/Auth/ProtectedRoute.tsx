import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "../Common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const token = useAuthStore((state) => state.token);

  if (isLoading || (token && !isAuthenticated)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
