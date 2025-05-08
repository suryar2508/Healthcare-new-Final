
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
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const hasAccess = user && (!roles || roles.includes(user.role));
      setIsAllowed(hasAccess);
      setIsChecked(true);
    }
  }, [user, roles, isLoading]);

  if (!isChecked || isLoading) {
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
