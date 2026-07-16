import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="py-24 text-center text-ink-soft">Chargement…</div>;
  }
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
