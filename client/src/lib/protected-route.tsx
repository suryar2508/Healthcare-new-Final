
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: React.ComponentType;
  roles?: string[];
}

export default function ProtectedRoute({ component: Component, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const hasAccess = user && (!roles || roles.includes(user.role));
      setIsAllowed(hasAccess);
      setIsInitialized(true);
    }
  }, [user, roles, isLoading]);

  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!isAllowed) {
    return <Redirect to="/unauthorized" />;
  }

  return <Component />;
}
