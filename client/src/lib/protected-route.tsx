import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  roles?: string[];
}

export default function ProtectedRoute({ component: Component, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Protected route check", { user, roles });
  }, [user, roles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  return <Component />;
}